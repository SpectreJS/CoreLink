ALTER TABLE parcels
  ADD COLUMN serial_number VARCHAR(32) NULL AFTER tracking_number;

ALTER TABLE parcels
  ADD UNIQUE KEY uq_parcels_serial_number (serial_number);

CREATE TABLE parcel_serial_counter (
  id TINYINT UNSIGNED NOT NULL,
  next_value INT UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
