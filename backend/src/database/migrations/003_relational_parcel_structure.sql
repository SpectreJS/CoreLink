-- Migration additive CoreLink.
-- `parcels` is the existing operational equivalent of the requested `colis` table.
-- It is extended in place to avoid duplicating parcel data.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS clients (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom VARCHAR(160) NOT NULL,
  prenom VARCHAR(160) NULL,
  email VARCHAR(254) NULL,
  telephone VARCHAR(40) NULL,
  adresse VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_clients_nom (nom),
  KEY idx_clients_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS modes_transport (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  nom VARCHAR(160) NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_modes_transport_code (code),
  UNIQUE KEY uq_modes_transport_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS statuts_colis (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  nom VARCHAR(160) NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_statuts_colis_code (code),
  UNIQUE KEY uq_statuts_colis_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO modes_transport (code, nom, description) VALUES
  ('air_express', 'Fret aérien express', 'Transport aérien prioritaire.'),
  ('air_regular', 'Fret aérien Régulier', 'Transport aérien standard.'),
  ('sea_lcl', 'Maritime', 'Transport maritime en groupage.')
ON DUPLICATE KEY UPDATE nom = VALUES(nom), description = VALUES(description);

INSERT INTO statuts_colis (code, nom, description) VALUES
  ('received', 'En attente', 'Colis enregistré et en attente de départ.'),
  ('in_transit', 'En transit', 'Colis en cours de transport.'),
  ('arrived', 'Arrivé', 'Colis arrivé au point de destination.'),
  ('delivered', 'Livré', 'Colis remis au destinataire.'),
  ('cancelled', 'Annulé', 'Colis annulé.')
ON DUPLICATE KEY UPDATE nom = VALUES(nom), description = VALUES(description);

-- MySQL has no portable IF NOT EXISTS form for ALTER TABLE ADD COLUMN.
DROP PROCEDURE IF EXISTS corelink_add_parcel_column;
DELIMITER //
CREATE PROCEDURE corelink_add_parcel_column(
  IN p_column_name VARCHAR(64),
  IN p_column_definition VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'parcels' AND information_schema.columns.column_name = p_column_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE parcels ADD COLUMN `', p_column_name, '` ', p_column_definition);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL corelink_add_parcel_column('numero_serie', 'VARCHAR(20) NULL');
CALL corelink_add_parcel_column('client_id', 'BIGINT UNSIGNED NULL');
CALL corelink_add_parcel_column('transport_id', 'INT UNSIGNED NULL');
CALL corelink_add_parcel_column('pays_depart', 'VARCHAR(100) NULL');
CALL corelink_add_parcel_column('ville_depart', 'VARCHAR(100) NULL');
CALL corelink_add_parcel_column('pays_destination', 'VARCHAR(100) NULL');
CALL corelink_add_parcel_column('ville_destination', 'VARCHAR(100) NULL');
CALL corelink_add_parcel_column('statut_id', 'INT UNSIGNED NULL');
CALL corelink_add_parcel_column('date_enregistrement', 'DATETIME NULL');
CALL corelink_add_parcel_column('date_livraison_prevue', 'DATE NULL');
DROP PROCEDURE corelink_add_parcel_column;

-- Widen only temporarily while replacing legacy tracking values.
ALTER TABLE parcels MODIFY COLUMN tracking_number VARCHAR(32) NULL;
UPDATE parcels
SET tracking_number = CONCAT('TMP', LPAD(id, 10, '0'));
SET @tracking_sequence = 0;
UPDATE parcels
SET tracking_number = CONCAT('CL-', LPAD((@tracking_sequence := @tracking_sequence + 1), 4, '0'))
ORDER BY id;
ALTER TABLE parcels
  MODIFY COLUMN tracking_number VARCHAR(7) NOT NULL,
  MODIFY COLUMN serial_number VARCHAR(20) NULL,
  MODIFY COLUMN description TEXT NOT NULL,
  MODIFY COLUMN weight DECIMAL(10,2) NOT NULL,
  MODIFY COLUMN length DECIMAL(10,2) NOT NULL DEFAULT 0,
  MODIFY COLUMN width DECIMAL(10,2) NOT NULL DEFAULT 0,
  MODIFY COLUMN height DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE parcels
SET numero_serie = serial_number
WHERE numero_serie IS NULL AND serial_number IS NOT NULL;
UPDATE parcels
SET date_enregistrement = created_at
WHERE date_enregistrement IS NULL;
UPDATE parcels
SET pays_depart = origin
WHERE pays_depart IS NULL;
UPDATE parcels
SET pays_destination = destination
WHERE pays_destination IS NULL;

INSERT INTO clients (nom, email, telephone)
SELECT DISTINCT customer_name, NULLIF(email, ''), phone
FROM parcels
WHERE customer_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM clients c
    WHERE c.nom = parcels.customer_name
      AND COALESCE(c.email, '') = COALESCE(NULLIF(parcels.email, ''), '')
      AND COALESCE(c.telephone, '') = COALESCE(parcels.phone, '')
  );

UPDATE parcels p
JOIN clients c
  ON c.nom = p.customer_name
 AND COALESCE(c.email, '') = COALESCE(NULLIF(p.email, ''), '')
 AND COALESCE(c.telephone, '') = COALESCE(p.phone, '')
SET p.client_id = c.id
WHERE p.client_id IS NULL;

UPDATE parcels p
JOIN modes_transport m ON m.code = p.transport_mode
SET p.transport_id = m.id
WHERE p.transport_id IS NULL;

UPDATE parcels p
JOIN statuts_colis s ON s.code = CASE p.status
  WHEN 'air_transit' THEN 'in_transit'
  WHEN 'sea_transit' THEN 'in_transit'
  WHEN 'customs_clearance' THEN 'in_transit'
  WHEN 'ready_for_pickup' THEN 'arrived'
  WHEN 'delayed' THEN 'in_transit'
  ELSE p.status
END
SET p.statut_id = s.id
WHERE p.statut_id IS NULL;

CREATE TABLE IF NOT EXISTS historique_colis (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  colis_id BIGINT UNSIGNED NOT NULL,
  ancien_statut_id INT UNSIGNED NULL,
  nouveau_statut_id INT UNSIGNED NOT NULL,
  commentaire VARCHAR(500) NULL,
  localisation VARCHAR(200) NULL,
  date_evenement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_historique_colis_date (colis_id, date_evenement),
  CONSTRAINT fk_historique_colis_colis FOREIGN KEY (colis_id) REFERENCES parcels (id) ON DELETE CASCADE,
  CONSTRAINT fk_historique_colis_ancien FOREIGN KEY (ancien_statut_id) REFERENCES statuts_colis (id) ON DELETE SET NULL,
  CONSTRAINT fk_historique_colis_nouveau FOREIGN KEY (nouveau_statut_id) REFERENCES statuts_colis (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP PROCEDURE IF EXISTS corelink_add_parcel_index;
DELIMITER //
CREATE PROCEDURE corelink_add_parcel_index(
  IN p_index_name VARCHAR(64),
  IN p_index_definition VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'parcels' AND information_schema.statistics.index_name = p_index_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE parcels ADD INDEX `', p_index_name, '` ', p_index_definition);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL corelink_add_parcel_index('idx_parcels_client_id', '(client_id)');
CALL corelink_add_parcel_index('idx_parcels_transport_id', '(transport_id)');
CALL corelink_add_parcel_index('idx_parcels_statut_id', '(statut_id)');
CALL corelink_add_parcel_index('idx_parcels_tracking_number', '(tracking_number)');
DROP PROCEDURE corelink_add_parcel_index;

DROP PROCEDURE IF EXISTS corelink_add_unique_parcel_index;
DELIMITER //
CREATE PROCEDURE corelink_add_unique_parcel_index()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'parcels' AND index_name = 'uq_parcels_numero_serie'
  ) THEN
    ALTER TABLE parcels ADD UNIQUE KEY uq_parcels_numero_serie (numero_serie);
  END IF;
END//
DELIMITER ;
CALL corelink_add_unique_parcel_index();
DROP PROCEDURE corelink_add_unique_parcel_index;

DROP PROCEDURE IF EXISTS corelink_add_parcel_fk;
DELIMITER //
CREATE PROCEDURE corelink_add_parcel_fk(
  IN p_constraint_name VARCHAR(64),
  IN p_column_name VARCHAR(64),
  IN p_referenced_table VARCHAR(64),
  IN p_referenced_column VARCHAR(64),
  IN p_delete_rule VARCHAR(30)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE() AND table_name = 'parcels'
      AND information_schema.table_constraints.constraint_name = p_constraint_name
  ) THEN
    SET @sql = CONCAT(
      'ALTER TABLE parcels ADD CONSTRAINT `', p_constraint_name, '` FOREIGN KEY (`', p_column_name,
      '`) REFERENCES `', p_referenced_table, '` (`', p_referenced_column, '`) ON DELETE ', p_delete_rule
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL corelink_add_parcel_fk('fk_parcels_client', 'client_id', 'clients', 'id', 'SET NULL');
CALL corelink_add_parcel_fk('fk_parcels_transport', 'transport_id', 'modes_transport', 'id', 'RESTRICT');
CALL corelink_add_parcel_fk('fk_parcels_statut', 'statut_id', 'statuts_colis', 'id', 'RESTRICT');
DROP PROCEDURE corelink_add_parcel_fk;

DROP TRIGGER IF EXISTS trg_parcels_history_insert;
DROP TRIGGER IF EXISTS trg_parcels_history_update;
DELIMITER //
CREATE TRIGGER trg_parcels_history_insert
AFTER INSERT ON parcels
FOR EACH ROW
BEGIN
  IF NEW.statut_id IS NOT NULL THEN
    INSERT INTO historique_colis (colis_id, nouveau_statut_id, date_evenement)
    VALUES (NEW.id, NEW.statut_id, COALESCE(NEW.date_enregistrement, NEW.created_at));
  END IF;
END//
CREATE TRIGGER trg_parcels_history_update
AFTER UPDATE ON parcels
FOR EACH ROW
BEGIN
  IF NOT (OLD.statut_id <=> NEW.statut_id) AND NEW.statut_id IS NOT NULL THEN
    INSERT INTO historique_colis (
      colis_id, ancien_statut_id, nouveau_statut_id, date_evenement
    ) VALUES (
      NEW.id, OLD.statut_id, NEW.statut_id, COALESCE(NEW.date_enregistrement, CURRENT_TIMESTAMP)
    );
  END IF;
END//
DELIMITER ;

CREATE TABLE IF NOT EXISTS parcel_tracking_counter (
  id TINYINT UNSIGNED NOT NULL,
  next_value INT UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO parcel_tracking_counter (id, next_value)
SELECT 1, COALESCE(MAX(CAST(SUBSTRING(tracking_number, 4) AS UNSIGNED)), 0) + 1
FROM parcels
ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, VALUES(next_value));

COMMIT;
