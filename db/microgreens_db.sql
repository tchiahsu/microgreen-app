CREATE DATABASE IF NOT EXISTS microgreens_db;

USE microgreens_db;

CREATE TABLE employee(
	employee_id INT AUTO_INCREMENT PRIMARY KEY, 
    ssn VARCHAR(12) UNIQUE, 
    first_name VARCHAR(64) NOT NULL, 
    last_name VARCHAR(64) NOT NULL, 
    email VARCHAR(64) UNIQUE NOT NULL, 
    title VARCHAR(64) NOT NULL,
    is_active BOOLEAN NOT NULL
);

CREATE TABLE delivery(
	delivery_date DATE PRIMARY KEY, 
    delivery_status ENUM("scheduled", "completed", "cancelled") NOT NULL DEFAULT "scheduled", 
	employee_id INT, 
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
		ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE restaurant(
	restaurant_id INT AUTO_INCREMENT PRIMARY KEY, 
    restaurant_name VARCHAR(64) UNIQUE NOT NULL, 
    street_num INT NOT NULL,
    street_name VARCHAR(64) NOT NULL, 
    city VARCHAR(32) NOT NULL, 
    state VARCHAR(2) NOT NULL, 	
    zip_code VARCHAR(5) NOT NULL
);

CREATE TABLE contact_info(
	contact_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT,
	email VARCHAR(128) UNIQUE, 
    first_name VARCHAR(64) NOT NULL, 
    last_name VARCHAR(64) NOT NULL, 
    phone VARCHAR(20) NOT NULL, 
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(restaurant_id)
		ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE customer_order(
	order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_type ENUM("one-time", "b-weekly", "weekly") NOT NULL,
    order_status ENUM("scheduled", "completed", "cancelled") NOT NULL, 
    employee_id INT NOT NULL,
    delivery_date DATE NOT NULL,
    restaurant_id INT NOT NULL,
    email VARCHAR(128), 
    date_created DATE NOT NULL,
    is_forced BOOLEAN NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) 
		ON UPDATE CASCADE ON DELETE RESTRICT, 
	FOREIGN KEY (delivery_date) REFERENCES delivery(delivery_date)
		ON UPDATE CASCADE ON DELETE RESTRICT,
	FOREIGN KEY (restaurant_id) REFERENCES restaurant(restaurant_id)
		ON UPDATE CASCADE ON DELETE RESTRICT,
	FOREIGN KEY (email) REFERENCES contact_info(email) 
		ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE packaging(
	package_id INT AUTO_INCREMENT PRIMARY KEY, 
    size_type VARCHAR(32) UNIQUE NOT NULL
);

CREATE TABLE product(
	product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(64) NOT NULL, 
    weight_grams INT CHECK(weight_grams > 0), 
    is_active BOOLEAN NOT NULL, 
	package_id INT NOT NULL, 
    UNIQUE (product_name, weight_grams),
    FOREIGN KEY (package_id) REFERENCES packaging(package_id)
		ON UPDATE CASCADE ON DELETE RESTRICT
) AUTO_INCREMENT = 100;

CREATE TABLE contains(
	order_id INT NOT NULL,
	product_id INT NOT NULL, 
    quantity INT CHECK(quantity > 0) NOT NULL, 
    PRIMARY KEY(order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES customer_order(order_id)
		ON UPDATE CASCADE ON DELETE RESTRICT, 
	FOREIGN KEY (product_id) REFERENCES product(product_id) 
		ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE crop(
	crop_id INT AUTO_INCREMENT PRIMARY KEY, 
    crop_name VARCHAR(64) UNIQUE NOT NULL, 
    seed_type VARCHAR(64), 
    sow_rate DECIMAL(10, 2) CHECK(sow_rate > 0) NOT NULL, 
    overnight_soak BOOL DEFAULT FALSE,
    germination_type ENUM("domed", "stacked", "blackout") NOT NULL,
    days_direct_light INT NOT NULL DEFAULT 0, 
    days_indirect_light INT NOT NULL, 
    rack_grow_days INT NOT NULL, 
    yield_per_tray DECIMAL(10, 2) CHECK(yield_per_tray > 0) NOT NULL 
);

CREATE TABLE plants(
	employee_id INT NOT NULL, 
    crop_id INT NOT NULL,
    PRIMARY KEY(employee_id, crop_id), 
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
		ON UPDATE CASCADE ON DELETE RESTRICT,
	FOREIGN KEY (crop_id) REFERENCES crop(crop_id)
		ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE composed_of(
	product_id INT NOT NULL, 
    crop_id INT NOT NULL, 
    crop_ratio DECIMAL(10,2) CHECK(crop_ratio > 0.0 AND crop_ratio <= 1.0) NOT NULL, 
    PRIMARY KEY(product_id, crop_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
		ON UPDATE CASCADE ON DELETE RESTRICT,
	FOREIGN KEY (crop_id) REFERENCES crop(crop_id)
		ON UPDATE CASCADE ON DELETE RESTRICT
);
