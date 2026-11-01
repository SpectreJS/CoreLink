CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  account_status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS account_status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL;

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

CREATE TABLE IF NOT EXISTS parcels (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tracking_number VARCHAR(7) NOT NULL,
  serial_number VARCHAR(20) NULL,
  numero_serie VARCHAR(20) NULL,
  client_id BIGINT UNSIGNED NULL,
  transport_id INT UNSIGNED NULL,
  pays_depart VARCHAR(100) NULL,
  ville_depart VARCHAR(100) NULL,
  pays_destination VARCHAR(100) NULL,
  ville_destination VARCHAR(100) NULL,
  statut_id INT UNSIGNED NULL,
  date_enregistrement DATETIME NULL,
  date_livraison_prevue DATE NULL,
  description TEXT NOT NULL,
  category VARCHAR(120) NOT NULL,
  package_count INT UNSIGNED NOT NULL DEFAULT 1,
  seal_number VARCHAR(120) NULL,
  weight DECIMAL(12,2) NOT NULL,
  length DECIMAL(12,2) NOT NULL DEFAULT 0,
  width DECIMAL(12,2) NOT NULL DEFAULT 0,
  height DECIMAL(12,2) NOT NULL DEFAULT 0,
  volume_cbm DECIMAL(12,3) NOT NULL DEFAULT 0,
  volumetric_weight DECIMAL(12,2) NOT NULL DEFAULT 0,
  customer_name VARCHAR(200) NOT NULL,
  recipient_name VARCHAR(200) NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(254) NULL,
  tax_id VARCHAR(120) NULL,
  origin VARCHAR(200) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  transport_mode ENUM('air_regular', 'air_express', 'sea_lcl') NOT NULL,
  status ENUM('received', 'air_transit', 'sea_transit', 'customs_clearance', 'ready_for_pickup', 'delivered', 'delayed') NOT NULL DEFAULT 'received',
  notes TEXT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  updated_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_parcels_tracking_number (tracking_number),
  UNIQUE KEY uq_parcels_serial_number (serial_number),
  UNIQUE KEY uq_parcels_numero_serie (numero_serie),
  KEY idx_parcels_status_created (status, created_at),
  KEY idx_parcels_customer_name (customer_name),
  KEY idx_parcels_client_id (client_id),
  KEY idx_parcels_transport_id (transport_id),
  KEY idx_parcels_statut_id (statut_id),
  CONSTRAINT fk_parcels_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id),
  CONSTRAINT fk_parcels_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id),
  CONSTRAINT fk_parcels_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL,
  CONSTRAINT fk_parcels_transport FOREIGN KEY (transport_id) REFERENCES modes_transport (id) ON DELETE RESTRICT,
  CONSTRAINT fk_parcels_statut FOREIGN KEY (statut_id) REFERENCES statuts_colis (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS parcel_serial_counter (
  id TINYINT UNSIGNED NOT NULL,
  next_value INT UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS parcel_tracking_counter (
  id TINYINT UNSIGNED NOT NULL,
  next_value INT UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS pricing_settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(40) NOT NULL,
  source_currency VARCHAR(3) NULL,
  target_currency VARCHAR(3) NULL,
  rate DECIMAL(14,4) NULL,
  amount DECIMAL(14,2) NULL,
  currency VARCHAR(3) NULL,
  minimum_billable DECIMAL(14,3) NULL,
  delivery_days VARCHAR(40) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  effective_date DATE NOT NULL,
  updated_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pricing_settings_key (setting_key),
  CONSTRAINT fk_pricing_settings_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS parcel_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  parcel_id BIGINT UNSIGNED NOT NULL,
  previous_status ENUM('received', 'air_transit', 'sea_transit', 'customs_clearance', 'ready_for_pickup', 'delivered', 'delayed') NULL,
  new_status ENUM('received', 'air_transit', 'sea_transit', 'customs_clearance', 'ready_for_pickup', 'delivered', 'delayed') NOT NULL,
  comment VARCHAR(500) NULL,
  changed_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_parcel_status_history_parcel (parcel_id, created_at),
  CONSTRAINT fk_parcel_status_history_parcel FOREIGN KEY (parcel_id) REFERENCES parcels (id) ON DELETE CASCADE,
  CONSTRAINT fk_parcel_status_history_admin FOREIGN KEY (changed_by) REFERENCES admin_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
