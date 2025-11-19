-- ======================== FUNCTIONS TO RETRIEVE ID FROM NAME ================================

/*
FUNCTIONS:
-----------
Retrieves the restaurant ID associated to the given restaurant name.
*/
DROP FUNCTION IF EXISTS get_restaurant_id;
DELIMITER //
CREATE FUNCTION get_restaurant_id(
	restaurant_name_p VARCHAR(64)
)
RETURNS VARCHAR(6)
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE restaurant_id VARCHAR(64);
    
    SELECT restaurant.restaurant_id INTO restaurant_id FROM restaurant
		WHERE restaurant.restaurant_name = restaurant_name_p;
	
    RETURN restaurant_id;
END //
DELIMITER ;

SELECT get_restaurant_id('Capo');

/*
FUNCTIONS
----------
Retrieves the product ID associated to the given product name
*/
DROP FUNCTION IF EXISTS get_product_id;
DELIMITER //
CREATE FUNCTION get_product_id(
	product_name_p VARCHAR(64),
    package_id_p INT
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE product_id VARCHAR(64);
    
    SELECT product.product_id INTO product_id FROM product
		WHERE product.product_name = product_name_p
			  AND
              product.package_id = package_id_p;
	
    RETURN product_id;
END //
DELIMITER ;

SELECT get_product_id('Radish, Sango', 1);

/*
FUNCTIONS
----------
Retrieves the package ID associated to the given package type
*/
DROP FUNCTION IF EXISTS get_package_id;
DELIMITER //
CREATE FUNCTION get_package_id(
	package_type_p VARCHAR(64)
)
RETURNS VARCHAR(32)
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE package_id VARCHAR(64);
	
    SELECT packaging.package_id INTO package_id FROM packaging
		WHERE packaging.size_type = package_type_p;
	
    RETURN package_id;
END //
DELIMITER ;

SELECT get_package_id('20" Live Tray');

/*
FUNCTIONS
----------
Retrieves the crop ID assoacited to the given crop
*/
DROP FUNCTION IF EXISTS get_crop_id;
DELIMITER //
CREATE FUNCTION get_crop_id(
	crop_name_p VARCHAR(64)
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE crop_id INT;
    
    SELECT crop.crop_id INTO crop_id FROM crop
		WHERE crop.crop_name = crop_name_p;
        
	RETURN crop_id;
END //
DELIMITER ;

SELECT get_crop_id('Amaranth');


-- =========================== VIEW PROCEDURES ====================================

/*
PROCEDURE
----------
Used to display infromation in the main page.
It filters the VIEW by the crops that need to be seeded on the given date.
It shows the name of the crop and the number of trays that need to be seeded.
*/
DROP PROCEDURE IF EXISTS get_planting_summary;
DELIMITER //
CREATE PROCEDURE get_planting_summary(
	input_date_p DATE
)
BEGIN
	SELECT crop_name, COUNT(trays_needed) AS trays_used FROM microgreens_view
		WHERE planting_date = input_date_p
		GROUP BY crop_name;
END//
DELIMITER ;

-- Test for the above procedure 
CALL get_planting_summary('2025-11-22');

/*
PROCEDURE
----------
Used to display information in the main page.
It filters the VIEW by the crops that need to be move out of the germination area into the grow area.
It shows the date the crop was seeded, the name, and the quantity.
*/
DROP PROCEDURE IF EXISTS get_germination_summary;
DELIMITER // 
CREATE PROCEDURE get_germination_summary(
	input_date_p DATE
)
BEGIN
	SELECT planting_date, crop_name, COUNT(trays_needed) AS trays_used FROM microgreens_view
		WHERE germination_date = input_date_p
		GROUP BY crop_name, planting_date;
END // 
DELIMITER ;

-- Test for the above procedure 
CALL get_germination_summary('2025-11-22');

/*
PROCEDURE
----------
Used to display information in the main page.
It filters the VIEW by the crops that need to be moved from direct light to indirect light during germination.
It shows the date the crop was seeded, the name, and the quantity.
*/
DROP PROCEDURE IF EXISTS get_switch_summary;
DELIMITER //
CREATE PROCEDURE get_switch_summary(
	input_date_p DATE
)
BEGIN
	SELECT planting_date, crop_name, COUNT(trays_needed) AS trays_used FROM microgreens_view
		WHERE (switch_date = input_date_p AND switch_date <> planting_date)
		GROUP BY crop_name, planting_date;
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_switch_summary('2025-11-22');

/*
PROCEDURE
----------
Used to display information in the harvest page (for harvest schedule).
It shows all the order that must be delivered on a specific delivery date.
It shows the product name and the number of products per packaging type.
*/
DROP PROCEDURE IF EXISTS get_orders_to_deliver;
DELIMITER //
CREATE PROCEDURE get_orders_to_deliver(
	order_delivery_date_p DATE
)
BEGIN
	SELECT product_name, size_type AS package_type, COUNT(*) AS package_count FROM (
		SELECT DISTINCT order_id, product_id, product_name, size_type, delivery_date FROM microgreens_view
		) as mv
		WHERE delivery_date = order_delivery_date_p
		GROUP BY product_name, size_type
		ORDER BY product_name, size_type;
END // 
DELIMITER ;

-- Test for the above procedure 
CALL get_orders_to_deliver('2025-12-23');

/*
PROCEDURE
----------
Used to display information in the harvest page.
For a given harvest day, it gets the crops that needed to harvested that day as well as the number of trays
for that crop.
*/
DROP PROCEDURE IF EXISTS get_crops_to_harvest;
DELIMITER //
CREATE PROCEDURE get_crops_to_harvest(
	order_delivery_date_p DATE
)
BEGIN
	SELECT planting_date, crop_name, SUM(quantity) AS trays_to_harvest FROM microgreens_view
		WHERE delivery_date =  order_delivery_date_p
		GROUP BY crop_name, planting_date;
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_crops_to_harvest('2025-12-23');

/*
PROCEDURE
----------
Used in the order page
For a given date, this procedure gets the information of the orders that need to be delivered on
that date. It specified the restaurant name, the product name, the packaging type and the product quantity.
*/
DROP PROCEDURE IF EXISTS get_orders_to_fulfill;
DELIMITER //
CREATE PROCEDURE get_orders_to_fulfill(
	order_delivery_date_p DATE
)
BEGIN
	WITH t AS(
	SELECT DISTINCT order_id, product_id, restaurant_name, product_name, size_type, quantity FROM microgreens_view
		WHERE (delivery_date = order_delivery_date_p)
	) SELECT restaurant_name, product_name, size_type AS package_type, SUM(quantity) AS product_quantity FROM t
		GROUP BY restaurant_name, product_name, size_type
		ORDER BY restaurant_name;
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_orders_to_fulfill('2025-12-23');

/*
PROCEDURE
----------
Used to get information for the crops page.
It obtains all the grow information about a crop. 
*/
DROP PROCEDURE IF EXISTS get_all_crop_information;
DELIMITER //
CREATE PROCEDURE get_all_crop_information()
BEGIN
	SELECT crop_name, sow_rate, overnight_soak, germination_type, days_direct_light, 
		days_indirect_light, rack_grow_days, yield_per_tray FROM crop;
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_all_crop_information();

/*
PROCEDURE
----------
Used in the product page.
Gets all the distinact names of the products.
*/
DROP PROCEDURE IF EXISTS get_all_product_name;
DELIMITER //
CREATE PROCEDURE get_all_product_name()
BEGIN
	SELECT DISTINCT product_name FROM product;
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_all_product_name();

/*
PROCEDURE
----------
Used in the product page.
It obtains the product composition for each unique product (ignores the size of the product)
*/
DROP PROCEDURE IF EXISTS get_all_product_composition;
DELIMITER //
CREATE PROCEDURE get_all_product_composition()
BEGIN
	SELECT product.product_name, crop.crop_name, composed_of.crop_ratio FROM product
		JOIN composed_of ON product.product_id = composed_of.product_id
		JOIN crop ON composed_of.crop_id = crop.crop_id
		GROUP BY product.product_name, crop.crop_name, composed_of.crop_ratio
		ORDER BY product.product_name; 
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_all_product_composition();

/*
PROCEDURE
----------
Used in the product page.
It obtains the information regarding the product's weight in grams and packaging type.
*/
DROP PROCEDURE IF EXISTS get_all_product_packages;
DELIMITER //
CREATE PROCEDURE get_all_product_packages()
BEGIN
	SELECT product.product_name, product.weight_grams, packaging.size_type AS packaging_type FROM product
		JOIN packaging ON product.package_id = packaging.package_id
		ORDER BY product.product_name;
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_all_product_packages();

/*
PROCEDURE
----------
Used in the resturant page.
It obtains all the name and id for all restaurants
*/
DROP PROCEDURE IF EXISTS get_all_restaurant_names;
DELIMITER //
CREATE PROCEDURE get_all_restaurant_names()
BEGIN
	SELECT restaurant_id, restaurant_name FROM restaurant;
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_all_restaurant_names();

/*
PROCEDURE
----------
Used in the restaurant page
This procedure obtains the restaurant's contact information and restaurant address.
*/
DROP PROCEDURE IF EXISTS get_all_restaurant_contact_info;
DELIMITER //
CREATE PROCEDURE get_all_restaurant_contact_info()
BEGIN 
	SELECT CONCAT(contact_info.first_name, ' ', contact_info.last_name) AS contact_name, contact_info.email, contact_info.phone,
		CONCAT(restaurant.street_num, ', ', restaurant.street_name, ', ', restaurant.city, ', ', restaurant.state, ', ', restaurant.zip_code)
		AS contact_address
		FROM contact_info
		JOIN restaurant ON contact_info.restaurant_id = restaurant.restaurant_id
		ORDER BY restaurant.restaurant_id;
END //
DELIMITER ;

-- Test for the above procedure 
CALL get_all_restaurant_contact_info();


-- =========================== ADD PROCEDURES ====================================

/*
PROCEDURE
----------
Adds a new order with the given information.
If the order is within the lead time then its marked as a forced order, else its a normal order.
If the order is marked as weekly or biweekly, then an order is created for that frequency until
the specified end date. Else, if its a stand alone order, its only created once
*/
DROP PROCEDURE IF EXISTS add_order;
DELIMITER //
CREATE PROCEDURE add_order(
    restaurant_id_p INT,
    product_id_p INT,
    product_quantity_p INT,
	order_type_p VARCHAR(32),
    end_date_p DATE,
    delivery_date_p DATE,
    order_status_p VARCHAR(20),
    employee_id_p INT
)
BEGIN
	-- declare variables to track missing/derived information
	DECLARE date_created DATE DEFAULT CURDATE();
    DECLARE curr_delivery_date DATE;
    DECLARE contact_email VARCHAR(128);
    DECLARE days_until_delivery INT;
    DECLARE required_lead_time INT;
    DECLARE is_forced BOOL;
    DECLARE delivery_date_exists BOOL;
    DECLARE new_order_id INT;
    
    -- Check the restaurant exists
    IF NOT EXISTS (SELECT 1 FROM restaurant WHERE restaurant.restaurant_id = restaurant_id_p) THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Invalid Restaurant.';
	END IF;
    
    -- Check the product exists
    IF NOT EXISTS (SELECT 1 FROM product WHERE product.product_id = product_id_p) THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Invalid Product.';
	END IF;
    
    -- Check the product has crop assigned to it
    IF (SELECT COUNT(*) FROM composed_of WHERE composed_of.product_id = product_id_p) = 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Product has no associated crops - unable to compute lead time';
	END IF;
    
    -- Check the employee exists
    IF NOT EXISTS (SELECT 1 FROM employee WHERE employee.employee_id = employee_id_p) THEN	
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Invalid Employee.';
	END IF;
    
	-- Validate order type
    IF order_type_p NOT IN ('one-time', 'bi-weekly', 'weekly') THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Invalid Order Type. Valid Option: weekly, bi-weekly, one-time';
	END IF;
    
    -- Validate order status
    IF order_status_p NOT IN ('pending', 'scheduled', 'completed', 'cancelled') THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Invalid Order Status. Valid Option: pending, scheduled, completed, cancelled';
	END IF;   
    
    -- Validate quantity
    IF product_quantity_p <= 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Quantity must be greater than zero';
    END IF;
    
    -- Validate data range
    IF delivery_date_p > end_date_p THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Delivery date cannot be after end date';
	END IF;

	-- Validate delivery date
    IF delivery_date_p < CURDATE() THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Delivery date cannot be before today';
	END IF;

	-- Get the first contact information from the restaurant
	SELECT contact_info.email INTO contact_email FROM contact_info
		WHERE contact_info.restaurant_id = restaurant_id_p
        LIMIT 1;

    -- Set today's date
    SET curr_delivery_date = delivery_date_p;

	recurring_loop: WHILE curr_delivery_date <= end_date_p DO
		-- Detemine the allowed lead time for this delivery date
        SET days_until_delivery = DATEDIFF(curr_delivery_date, CURDATE());
        
		SELECT MAX(days_indirect_light + days_direct_light + rack_grow_days) INTO required_lead_time FROM crop
			JOIN composed_of ON crop.crop_id = composed_of.crop_id
			WHERE composed_of.product_id = product_id_p;
		
		IF (required_lead_time > days_until_delivery) THEN
			SET is_forced = TRUE;
		ELSE
			SET is_forced = FALSE;
		END IF;
        
        -- Check that the delivery date exists, add it if it doesn't exist
		SELECT COUNT(*) INTO delivery_date_exists FROM delivery
			WHERE delivery.delivery_date = curr_delivery_date;

    	IF (delivery_date_exists = 0) THEN
			INSERT INTO delivery (delivery_date, delivery_status, employee_id) VALUE (curr_delivery_date, 'scheduled', NULL);
		END IF;
    
		-- Add new order
		INSERT INTO customer_order (order_type, order_status, employee_id, delivery_date, restaurant_id, email, date_created, is_forced) VALUE
			(order_type_p, order_status_p, employee_id_p, curr_delivery_date, restaurant_id_p, contact_email, date_created, is_forced);
		
        -- Add order into the 'contains' table
        SET new_order_id = LAST_INSERT_ID();

		INSERT INTO contains (order_id, product_id, quantity) VALUE
			(new_order_id, product_id_p, product_quantity_p);
		
        IF (order_type_p NOT IN ('weekly', 'bi-weekly')) THEN
			LEAVE recurring_loop;
		END IF;
        
        -- Increment date
        IF (order_type_p = 'weekly') THEN
			SET curr_delivery_date = DATE_ADD(curr_delivery_date, INTERVAL 7 DAY);
		ELSEIF (order_type_p = 'bi-weekly') THEN
			SET curr_delivery_date = DATE_ADD(curr_delivery_date, INTERVAL 14 DAY);
		END IF;
	
    END WHILE recurring_loop;

END //
DELIMITER ;

CALL add_order(1, 135, 10, 'weekly','2025-02-01', '2025-01-03','scheduled', 9); -- FORCED
CALL add_order(1, 135, 10, 'weekly','2025-02-01', '2026-01-13','scheduled', 9); -- NOT FORCED

CALL add_order(1000, 135, 10, 'weekly','2026-02-01', '2026-01-13','scheduled', 9); -- Invalid Restaurant
CALL add_order(1, 1000, 10, 'weekly','2026-02-01', '2026-01-13','scheduled', 9);-- Invalid Product
CALL add_order(1, 135, 10, 'weekly','2026-02-01', '2026-01-13','scheduled', 999); -- Invalid Employee
CALL add_order(1, 135, 10, 'never','2025-02-01', '2025-01-03','scheduled', 9); -- Invalid Order Type
CALL add_order(1, 135, 10, 'weekly','2025-02-01', '2025-01-03','something', 9); -- Invalid Order Status
CALL add_order(1, 135, -10, 'weekly','2025-02-01', '2025-01-03','scheduled', 9);-- Invalid Quantity
CALL add_order(1, 135, 10, 'weekly','2025-02-01', '2024-01-03','scheduled', 9); -- Invalid Data Range
CALL add_order(1, 135, 10, 'weekly','2024-02-01', '2025-01-03','scheduled', 9); -- Invalid Delivery Date

/*
PROCEDURE
----------
Adds a new crop to the crop table.
*/
DROP PROCEDURE IF EXISTS add_crop;
DELIMITER //
CREATE PROCEDURE add_crop(
    crop_name_p VARCHAR(64), 
    seed_type_p VARCHAR(64), 
    sow_rate_p DECIMAL(10, 2), 
    overnight_soak_p BOOL,
    germination_type_p VARCHAR(10),
    days_direct_light_p INT, 
    days_indirect_light_p INT, 
    rack_grow_days_p INT, 
    yield_per_tray_p INT
)
BEGIN
	-- Check germination type is valid option
    IF germination_type_p NOT IN ('blackout', 'stacked', 'domed') THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Invalid germination type. Valid options: blackout, stacked, domed.';
	END IF;

    -- Check day in direct light is greater than or equal to 0
    IF days_direct_light_p < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Days in direct light cannot be negative.';
	END IF;
    
    -- Check day in indirect light is greater than or equal to 0
    IF days_indirect_light_p < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Days in indirect light cannot be negative.';
	END IF;

    -- Check day in grow rack is greater than or equal to 0
    IF rack_grow_days_p < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Days in grow racks cannot be negative.';
	END IF;

    -- Check yield per tray is greater than or equal to 0
    IF yield_per_tray_p < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Yield cannot be negative.';
	END IF;
    
	-- Insert into the crops table
	INSERT INTO crop (crop_name, seed_type, sow_rate, overnight_soak, germination_type, days_direct_light, days_indirect_light, rack_grow_days, yield_per_tray)
		VALUES (crop_name_p, seed_type_p, sow_rate_p, overnight_soak_p, germination_type_p, days_direct_light_p, days_indirect_light_p, rack_grow_days_p, yield_per_tray_p);
END //
DELIMITER ;

CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', 0, 3, 7, 20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackoutss', 0, 3, 7, -20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', -1, 3, 7, 20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', 0, -3, 7, 20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', 0, 3, -7, 20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', 0, 3, 7, -20.0);




/*
PROCEDURE
----------
Add a new packaging option
*/
DROP PROCEDURE IF EXISTS add_packaging;
DELIMITER //
CREATE PROCEDURE add_packaging(
	size_type_p VARCHAR(32)
)
BEGIN
	DECLARE package_exists INT;
    
    -- Check that the packaging doesn't exist
    SELECT COUNT(*) INTO package_exists FROM packaging
		WHERE packaging.size_type = size_type_p;
	
    IF package_exists > 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Package name already exists!';
	END IF;
    
	INSERT INTO packaging (size_type) VALUES (size_type_p);
END //
DELIMITER ;

CALL add_packaging('Medium');

/*
PROCEDURE
----------
Add a new product offering
*/
DROP PROCEDURE IF EXISTS add_product_offering;
DELIMITER //
CREATE PROCEDURE add_product_offering(
    product_name_p VARCHAR(64),
    weight_grams_p INT,
    is_active_p BOOLEAN,
    package_id_p INT
)
BEGIN
	DECLARE is_name_valid INT;
    DECLARE is_package_valid INT;
    
    -- Check the name is not already used
    SELECT COUNT(*) INTO is_name_valid FROM product
		WHERE product.product_name = product_name_p;
	
    IF is_name_valid > 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Product name already exists!';
	END IF;
    
    -- Check the pacakge exists
    SELECT COUNT(*) INTO is_package_valid FROM packaging
		WHERE packaging.package_id = package_id_p;
	
    IF is_package_valid = 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Packaging type does not exist';
	END IF;

	INSERT INTO product (product_name, weight_grams, is_active, package_id) VALUES
		(product_name_p, weight_grams_p, is_active_p, package_id_p);
END //
DELIMITER ;

CALL add_product_offering('Tony Hsu', 100, TRUE, 5); -- valid
CALL add_product_offering('Hsu', 100, TRUE, 7); -- invalid package
CALL add_product_offering('Hsuter', 100, TRUE, 7); -- invalid name

/*
PROCEDURE
----------
Add a crop composition to an existing product
*/
DROP PROCEDURE IF EXISTS add_product_crop_composition;
DELIMITER //
CREATE PROCEDURE add_product_crop_composition(
	product_id_p INT,
    crop_id_p INT,
    crop_ratio_p DECIMAL(10,2)
)
BEGIN
	DECLARE valid_product INT;
    DECLARE valid_crop INT;
    
    -- Check product does exist
    SELECT COUNT(*) INTO valid_product FROM product
		WHERE product.product_id = product_id_p;
	
    IF valid_product = 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Product does not exist';
	END IF;
	
    -- Check crop does exist
	SELECT COUNT(*) INTO valid_crop FROM crop
		WHERE crop.crop_id = crop_id_p;

    IF valid_crop = 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Crop does not exist';
	END IF;
    
	-- Check the product composition is valid
	IF crop_ratio_p > 1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Crop composition cannot exceed 1.0';
	ELSEIF crop_ratio_p <= 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Crop composition cannot be les than or equal to 0.0';
	END IF;
    
	INSERT INTO composed_of (product_id, crop_id, crop_ratio) VALUES	
		(product_id_p, crop_id_p, crop_ratio_p);
END //
DELIMITER ;

CALL add_product_crop_composition(300, 1, 0.50);
CALL add_product_crop_composition(105, 100, 0.50);

/*
PROCEDURE
----------
Add a new contact information
*/
DROP PROCEDURE IF EXISTS add_contact_info;
DELIMITER //
CREATE PROCEDURE add_contact_info(
	restaurant_id_p INT,
    email_p VARCHAR(128),
    first_name_p VARCHAR(64),
    last_name_p VARCHAR(64),
    phone_p VARCHAR(20)
)
BEGIN
	DECLARE is_email_unique INT;

    -- Ensure the email doesn't already exist
    SELECT COUNT(*) INTO is_email_unique FROM contact_info
		WHERE contact_info.email = email_p;

	IF is_email_unique > 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'This email already exists!';
	END IF;

	INSERT INTO contact_info (restaurant_id, email, first_name, last_name, phone) VALUES
		(restaurant_id_p, email_p, first_name_p, last_name_p, phone_p);
END //
DELIMITER ;

CALL add_contact_info(1, 'tony@kitchen.test', 'Tony', 'Hsu', '123-567-8900');
CALL add_contact_info(1, 'tony@kitchen.test', 'Tonys', 'Hsu T', '222-567-8900');

/*
PROCEDURE
----------
Add a new client/restaurant
*/
DROP PROCEDURE IF EXISTS add_client;
DELIMITER //
CREATE PROCEDURE add_client(
    restaurant_name_p VARCHAR(64),
    street_num_p INT,
    street_name_p VARCHAR(64),
    city_p VARCHAR(32),
    state_p VARCHAR(2),
    zip_code_p VARCHAR(5)
)
BEGIN
	DECLARE is_state_valid INT;
    DECLARE is_zip_valid INT;

	-- Check STATE is 2 characters
    IF CHAR_LENGTH(state_p) <> 2 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'The state must be 2 characters. i.e. Massachusetts is MA';
	END IF;
    
    -- Check Zipcode is 5 characters
    IF CHAR_LENGTH(zip_code_p) <> 5 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'The zip code must be 5 characters.';
	END IF;

	INSERT INTO restaurant (restaurant_name, street_num, street_name, city, state, zip_code) VALUE
		(restaurant_name_p, street_num_p, street_name_p, city_p, state_p, zip_code_p);
END //
DELIMITER ;

CALL add_client('Tony Kitchen', 99, 'Hemenway Street', 'Boston', 'MA', '02118');
CALL add_client('Mish Kitchen', 99, 'Hemenway Street', 'Boston', '1', '02118'); -- bad state
CALL add_client('Harr Kitchen', 99, 'Hemenway Street', 'Boston', 'MA', '0211'); -- bad zipcode


/*
PROCEDURE
----------
Add a new employee to the system
*/
DROP PROCEDURE IF EXISTS add_employee;
DELIMITER //
CREATE PROCEDURE add_employee(
	ssn_p VARCHAR(12),
    first_name_p VARCHAR(64),
    last_name_p VARCHAR(64),
    email_p VARCHAR(64),
    title_p VARCHAR(64)
)
BEGIN
	DECLARE is_ssn_unique INT;
    DECLARE is_email_unique INT;

	-- Check for a unique SSN
    SELECT COUNT(*) INTO is_ssn_unique FROM employee
		WHERE employee.ssn = ssn_p;
	
    IF is_ssn_unique > 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Employee with this SSN already exists';
	END IF;

    -- Check for a unique Email
    SELECT COUNT(*) INTO is_email_unique FROM employee
		WHERE employee.email = email_p;
        
	IF is_email_unique > 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Employee with this email already exists';
	END IF;

	INSERT INTO employee (ssn, first_name, last_name, email, title) VALUES
		(ssn_p, first_name_p, last_name_p, email_p, title_p);
END //
DELIMITER ;

CALL add_employee('123-43-2093', 'Tony', 'Hsu', 'tony@gmail.com', 'janitor'); -- Good
CALL add_employee('123-43-2093', 'Tony', 'Hsu', 'tony2@gmail.com', 'janitor'); -- SSN fails
CALL add_employee('123-43-2092', 'Tony', 'Hsu', 'tony@gmail.com', 'janitor'); -- Email fails
 

-- ======================== DELETE PROCEDURES =================================
 
/*
PROCEDURE
----------
This procedure deletes a product referenced by the product_id in the contains table.
*/
DROP PROCEDURE IF EXISTS delete_from_contains;
DELIMITER //
CREATE PROCEDURE delete_from_contains(
	product_id_p INT
)
BEGIN
	START TRANSACTION;
    DELETE FROM contains
		WHERE contains.product_id = product_id_p;
    COMMIT;
END //
DELIMITER ;
 
/*
PROCEDURE
----------
This procedure deletes a product referenced by the product_id in the composed_of table.
*/
DROP PROCEDURE IF EXISTS delete_from_composed_of;
DELIMITER //
CREATE PROCEDURE delete_from_composed_of(
	product_id_p INT
)
BEGIN
	START TRANSACTION;
    DELETE FROM composed_of
		WHERE composed_of.product_id = product_id_p;
    COMMIT;
END //
DELIMITER ;
 
/*
PROCEDURE
----------
This procedure deletes a product in the products table. 
It first checks if the row with the given product_id has been deleted in the parent tables: contains and composed_of.
If it has been deleted, it proceeds to delete the row of the given product_id in the table. 
It it hasn't been deleted an error gets signaled. 
*/
DROP PROCEDURE IF EXISTS delete_product;
DELIMITER //
CREATE PROCEDURE delete_product(
	product_id_p INT
)
BEGIN
	DECLARE count_check INT DEFAULT 0;
    START TRANSACTION;
        SELECT COUNT(*) INTO count_check FROM contains 
			WHERE contains.product_id = product_id_p;
		IF count_check > 0 THEN ROLLBACK;
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = "Can't delete this row, it is being referenced in the contains table.";
		END IF;
 
		SELECT COUNT(*) INTO count_check FROM composed_of 
			WHERE composed_of.product_id = product_id_p;
		IF count_check > 0 THEN ROLLBACK;
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = "Can't delete this row, it is being referenced in the composed_of table.";
		END IF;
		DELETE FROM product WHERE product.product_id = product_id_p;
    COMMIT;
END //
DELIMITER ;
 
-- Tests deleting a product in the product table without deleting it first in contains and composed_of. 
CALL delete_product(101);
 
-- Tests deleting a product in the contains table. 
CALL delete_from_contains(101);
 
-- Tests deleting a product in the composed_if table. 
CALL delete_from_composed_of(101);
 
-- Tests deleting the product again in the product table after removing the row in the parent tables. 
CALL delete_product(101);
 
 
/*
PROCEDURE
----------
This procedure deletes the contact info of the client referenced by the email in the customer_order table.
*/
DROP PROCEDURE IF EXISTS delete_from_customer_order;
DELIMITER //
CREATE PROCEDURE delete_from_customer_order(
	email_p VARCHAR(128) 
)
BEGIN
	START TRANSACTION;
    DELETE FROM customer_order
		WHERE customer_order.email = email_p;
    COMMIT;
END //
DELIMITER ;
 
/*
PROCEDURE
----------
This procedure deletes a client's contact info in the contact_info table. 
It first checks if the row with the given meail has been deleted in the parent table: customer_order.
If it has been deleted, it proceeds to delete the row of the given email in the table. 
It it hasn't been deleted an error gets signaled. 
*/
DROP PROCEDURE IF EXISTS delete_contact_info;
DELIMITER //
CREATE PROCEDURE delete_contact_info(
	email_p VARCHAR(128) 
)
BEGIN
	DECLARE count_check INT DEFAULT 0;
    START TRANSACTION;
        SELECT COUNT(*) INTO count_check FROM customer_order 
			WHERE customer_order.email = email_p;
		IF count_check > 0 THEN ROLLBACK;
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = "Can't delete this row, it is being referenced in the customer_order table.";
		END IF;
		DELETE FROM contact_info WHERE contact_info.email = email_p;
    COMMIT;
END //
DELIMITER ;
 
-- Tests deleting the contact_info in the product table without deleting it first in customer_order table. 
CALL delete_contact_info("adrian.s@zuma.test");
-- Tests deleting the contact_info in the customer_order table. 
CALL delete_from_customer_order("adrian.s@zuma.test");
-- Tests deleting the contact_info again in the customer_order table after removing the row in the parent table. 
CALL delete_contact_info("adrian.s@zuma.test");


-- ======================== UPDATE PROCEDURES =================================

/*
PROCEDURE
----------
This procedure updates new crop information provided on the crop table.
*/
DROP PROCEDURE IF EXISTS update_crop_table;
DELIMITER //
CREATE PROCEDURE update_crop_table(
	crop_id_p INT, 
    crop_name_p VARCHAR(64), 
    seed_type_p VARCHAR(64), 
    sow_rate_p DECIMAL(10, 2), 
    overnight_soak_p BOOL,
    germination_type_p VARCHAR(10),
    days_direct_light_p INT, 
    days_indirect_light_p INT, 
    rack_grow_days_p INT, 
    yield_per_tray_p INT 
)
BEGIN
	DECLARE found_id INT;
    -- Check if value provided for crop_id is valid
    SELECT crop_id INTO found_id FROM crop
		WHERE crop_id = crop_id_p;
        
	IF found_id IS NULL THEN
		SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'The value provided for crop_id is not valid.';
    END IF;
    
    -- Check the values provided for sow_rate, yield_per_tray, and germination_type fall within the requirements
	IF sow_rate_p IS NOT NULL AND sow_rate_p <= 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'The value provided for sow_rate cannot be less than or equal to 0.';
    END IF;

	IF yield_per_tray_p IS NOT NULL AND yield_per_tray_p <= 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'The value provided for yield_per_tray cannot be less than or equal to 0.';
    END IF;
	
    IF germination_type_p NOT IN ('domed', 'stacked', 'blackout') THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'The value provided for yield_per_tray must be either: domed, stacked, or blackout.';
    END IF;
    
	UPDATE crop
    SET crop_name = COALESCE(crop_name_p, crop_name),
		seed_type = COALESCE(seed_type_p, seed_type),
		sow_rate = COALESCE(sow_rate_p, sow_rate),
		overnight_soak = COALESCE(overnight_soak_p, overnight_soak),
		germination_type = COALESCE(germination_type_p, germination_type),
		days_direct_light = COALESCE(days_direct_light_p, days_direct_light),
		days_indirect_light = COALESCE(days_indirect_light_p, days_indirect_light),
		rack_grow_days = COALESCE(rack_grow_days_p, rack_grow_days),
		yield_per_tray = COALESCE(yield_per_tray_p, yield_per_tray)
	WHERE crop_id = crop_id_p;
END //
DELIMITER ; 

-- Test the above procedure by changing the name of the crop, germ type, days in direct/indirect light, rack grow days and yield per tray.
CALL update_crop_table(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'stacked', 4, 5, 6, 111);

-- Test above procedure when an unvalid crop_id is provided
CALL update_crop_table(0, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'stacked', 4, 5, 6, 111);

-- Test above procedure when an unvalid sow_rate value ( <= 0) is provided
CALL update_crop_table(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 0, FALSE, 'stacked', 4, 5, 6, 111);	

-- Test above procedure when an unvalid yield_per_tray value ( <= 0) is provided
CALL update_crop_table(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'stacked', 4, 5, 6, 0);	

-- Test above procedure when an unvalid germination_type value is provided
CALL update_crop_table(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'test', 4, 5, 6, 111);	

-- Test above procedure when only some values are provided and some are left null
CALL update_crop_table(1, NULL, 'Amaranth, Red Garnet', 4, FALSE, 'stacked', NULL, NULL, NULL, 112);	

-- Test above procedure when THE crop_id provided is null
CALL update_crop_table(NULL, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'stacked', 4, 5, 6, 112);	

/*
PROCEDURE
----------
This procedure updates new packaging information provided on the packaging table.
*/
DROP PROCEDURE IF EXISTS update_packaging_table;
DELIMITER //
CREATE PROCEDURE update_packaging_table(
	package_id_p INT, 
    size_type_p VARCHAR(32)
)
BEGIN
	DECLARE found_id INT;
    -- Check if value provided for package_id is valid
    SELECT package_id INTO found_id FROM packaging
		WHERE package_id = package_id_p;
        
	IF found_id IS NULL THEN
		SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'The value provided for package_id is not valid.';
    END IF;
    
	UPDATE packaging
    SET size_type = COALESCE(size_type_p, size_type)
	WHERE package_id = package_id_p;
END //
DELIMITER ; 

-- Test above procedure by providing a new value to size_type
CALL update_packaging_table(4, 'A Test');

-- Test above procedure by providing null to size_type
CALL update_packaging_table(4, NULL);

-- Test above procedure by providing an invalid package_id
CALL update_packaging_table(200, 'A Test');

-- Test above procedure by providing an null value for package_id
CALL update_packaging_table(NULL, 'A Test');

/*
PROCEDURE
----------
This procedure updates new product information provided on the product table.
*/
DROP PROCEDURE IF EXISTS update_product_table;
DELIMITER //
CREATE PROCEDURE update_product_table(
	product_id_p INT,
    product_name_p VARCHAR(64),
    weight_grams_p INT, 
    is_active_p BOOLEAN, 
    package_id_p INT
)
BEGIN
	DECLARE found_id INT;
    -- Check if value provided for product_id is valid
    SELECT product_id INTO found_id FROM product
		WHERE product_id = product_id_p;
        
	IF found_id IS NULL THEN
		SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'The value provided for product_id is not valid.';
    END IF;
    
    -- Check the value provided for weight_grams_p falls within the requirements
	IF weight_grams_p IS NOT NULL AND weight_grams_p <= 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'The value provided for weight_grams cannot be less than or equal to 0.';
    END IF;
    
	UPDATE product
    SET product_name = COALESCE(product_name_p, product_name),
		weight_grams = COALESCE(weight_grams_p, weight_grams),
		is_active = COALESCE(is_active_p, is_active),
        package_id = COALESCE(package_id_p, package_id)
	WHERE product_id = product_id_p;
END //
DELIMITER ; 

-- Test above procedure by updating product's name and package_id from 1 to 4
CALL update_product_table(102, 'Amaranth TEST2', 43, TRUE, 4);

-- Test above procedure by providing invalid value for weight_grams
CALL update_product_table(102, 'Amaranth TEST2', 0, TRUE, 4);	

-- Test above procedure by providing NULL vals to some parameters
CALL update_product_table(102, NULL, NULL, TRUE, 4);	

-- Test above procedure by providing an invalid product_id
CALL update_product_table(1010, 'Amaranth TEST2', 43, TRUE, 4);	

-- Test above procedure by providing an null value for product_id
CALL update_product_table(NULL, 'Amaranth TEST2', 43, TRUE, 4);	

/*
PROCEDURES
-----------
Update the crop ratios for a given product.
*/
DROP PROCEDURE IF EXISTS update_composed_of_table;
DELIMITER //
CREATE PROCEDURE update_composed_of_table(
	product_id_p INT, 
    crop_id_p INT,
	crop_ratio_p DECIMAL(10,2) 
)
BEGIN
	DECLARE found_id INT;
    -- Check if value provided for product_id is valid
    SELECT product_id INTO found_id FROM product
		WHERE product_id = product_id_p;
        
	IF found_id IS NULL THEN ROLLBACK;
		SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'The value provided for product_id is not valid.';
    END IF;
    
    SELECT crop_id INTO found_id FROM crop
		WHERE crop_id = crop_id_p;
	
    IF found_id IS NULL THEN ROLLBACK;
		SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'The value provided for crop_id is not valid.';
	END IF;

	-- Check the value provided for crop_ratio_p falls within the requirements
	IF crop_ratio_p IS NOT NULL AND crop_ratio_p <= 0.0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'The value provided for crop_ratio_p cannot be less than or equal to 0.';
    END IF;
    
    IF crop_ratio_p IS NOT NULL AND crop_ratio_p > 1.0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'The value provided for crop_ratio_p cannot be greater than 1.';
    END IF;
    
    UPDATE composed_of
    SET crop_ratio = COALESCE(crop_ratio_p, crop_ratio)
    WHERE product_id = product_id_p AND crop_id = crop_id_p;
END //
DELIMITER ;

CALL update_composed_of_table(102, 1, 0.5);

CALL update_composed_of_table(1000, 1, 0.5);

CALL update_composed_of_table(102, 1000, 0.5);

/*
PROCEDURE
----------
This procedure updates new client contact information provided on the contact_info table.
*/
DROP PROCEDURE IF EXISTS update_contact_info_table;
DELIMITER //
CREATE PROCEDURE update_contact_info_table(
	email_p VARCHAR(128), 
    first_name_p VARCHAR(64), 
    last_name_p VARCHAR(64), 
    phone_p VARCHAR(20),
    restaurant_id_p VARCHAR(6)
)
BEGIN
	DECLARE found_email VARCHAR(128);
    -- Check if value provided for email is valid
    SELECT email INTO found_email FROM contact_info
		WHERE email = email_p;
        
	IF found_email IS NULL THEN
		SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'The value provided for email is not valid.';
    END IF;
    
    
	UPDATE contact_info
    SET first_name = COALESCE(first_name_p, first_name),
		last_name = COALESCE(last_name_p, last_name),
		phone = COALESCE(phone_p, phone),
        restaurant_id = COALESCE(restaurant_id_p, restaurant_id)
	WHERE email = email_p;
END //
DELIMITER ; 

-- Test above procedure by updating contact's name and phone number 
CALL update_contact_info_table('tyler@hobsons.test', 'Tyler UPDATE', 'Khan UPDATE', '(111) 111-TEST', 'ALL001');

-- Test above procedure by updating contact's restaurant_id from ALL001 to ALL002
CALL update_contact_info_table('tyler@hobsons.test', 'Tyler UPDATE', 'Khan UPDATE', '(111) 111-TEST', 'ALL002');	

-- Test above procedure by providing NULL values 
CALL update_contact_info_table('tyler@hobsons.test', 'Tyler UPDATE', NULL, NULL);	

-- Test above procedure by providing invalid values for the email
CALL update_contact_info_table('tyler@hobsons.test.UPDATE', 'Tyler UPDATE', 'Khan UPDATE', '(111) 111-TEST');	

-- Test above procedure by providing invalid values for the email
CALL update_contact_info_table(NULL, 'Tyler UPDATE', 'Khan UPDATE', '(111) 111-TEST');	


