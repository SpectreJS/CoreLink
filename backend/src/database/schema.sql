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

CREATE TABLE IF NOT EXISTS parcels (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tracking_number VARCHAR(32) NULL,
  serial_number VARCHAR(32) NULL,
  description VARCHAR(500) NOT NULL,
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
  KEY idx_parcels_status_created (status, created_at),
  KEY idx_parcels_customer_name (customer_name),
  CONSTRAINT fk_parcels_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id),
  CONSTRAINT fk_parcels_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS parcel_serial_counter (
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
