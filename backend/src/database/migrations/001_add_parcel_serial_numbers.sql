UPDATE parcels SET tracking_number = CONCAT('TMP', LPAD(id, 10, '0'));

SET @tracking_sequence = 0;
UPDATE parcels
SET tracking_number = CONCAT('CL-', LPAD((@tracking_sequence := @tracking_sequence + 1), 4, '0'))
ORDER BY id ASC;

ALTER TABLE parcels
  MODIFY COLUMN tracking_number VARCHAR(7) NOT NULL;

ALTER TABLE parcels
  ADD UNIQUE KEY uq_parcels_tracking_number (tracking_number);

ALTER TABLE parcels
  ADD COLUMN serial_number VARCHAR(32) NULL AFTER tracking_number;

ALTER TABLE parcels
  ADD UNIQUE KEY uq_parcels_serial_number (serial_number);

CREATE TABLE parcel_serial_counter (
  id TINYINT UNSIGNED NOT NULL,
  next_value INT UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE parcel_tracking_counter (
  id TINYINT UNSIGNED NOT NULL,
  next_value INT UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO parcel_tracking_counter (id, next_value) VALUES (1, (SELECT COUNT(*) + 1 FROM parcels));
