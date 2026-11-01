START TRANSACTION;

UPDATE parcels SET tracking_number = CONCAT('TMP', LPAD(id, 10, '0'));

SET @tracking_sequence = 0;
UPDATE parcels
SET tracking_number = CONCAT('CL-', LPAD((@tracking_sequence := @tracking_sequence + 1), 4, '0'))
ORDER BY id ASC;

ALTER TABLE parcels
  MODIFY COLUMN tracking_number VARCHAR(7) NOT NULL;

CREATE TABLE IF NOT EXISTS parcel_tracking_counter (
  id TINYINT UNSIGNED NOT NULL,
  next_value INT UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO parcel_tracking_counter (id, next_value)
VALUES (1, (SELECT COUNT(*) + 1 FROM parcels))
ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, VALUES(next_value));

COMMIT;
