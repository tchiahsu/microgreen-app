USE microgreens_db;

-- ============================================================================================================

SELECT get_restaurant_id('Capo');

SELECT get_product_id('Radish, Sango', 1);

SELECT get_package_id('20" Live Tray');

SELECT get_crop_id('Amaranth');

-- ============================================================================================================

CALL get_planting_summary('2025-11-22');

CALL get_germination_summary('2025-11-22');

CALL get_switch_summary('2025-11-22');

CALL get_orders_to_deliver('2025-12-23');

CALL get_packagings_per_product('2025-12-23');

CALL get_crops_to_harvest('2025-12-23');

CALL get_orders_to_fulfill('2025-12-23');

CALL get_all_crop_information();

CALL get_all_product_name();

CALL get_all_product_composition();

CALL get_all_product_packages();

CALL get_all_restaurant_names();

CALL get_all_restaurant_contact_info();

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

CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', 0, 3, 7, 20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackoutss', 0, 3, 7, -20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', -1, 3, 7, 20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', 0, -3, 7, 20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', 0, 3, -7, 20.0);
CALL add_crop('Tony', 'Hsu Tai Seed', 4, TRUE, 'blackout', 0, 3, 7, -20.0);

CALL add_packaging('Medium');

CALL add_product_offering('Tony Hsu', 100, TRUE, 5); -- valid
CALL add_product_offering('Hsu', 100, TRUE, 7); -- invalid package
CALL add_product_offering('Hsuter', 100, TRUE, 7); -- invalid name

CALL add_product_crop_composition(300, 1, 0.50);
CALL add_product_crop_composition(105, 100, 0.50);

CALL add_contact_info(1, 'tony@kitchen.test', 'Tony', 'Hsu', '123-567-8900');
CALL add_contact_info(1, 'tony@kitchen.test', 'Tonys', 'Hsu T', '222-567-8900');

CALL add_client('Tony Kitchen', 99, 'Hemenway Street', 'Boston', 'MA', '02118');
CALL add_client('Mish Kitchen', 99, 'Hemenway Street', 'Boston', '1', '02118'); -- bad state
CALL add_client('Harr Kitchen', 99, 'Hemenway Street', 'Boston', 'MA', '0211'); -- bad zipcode

CALL add_employee('123-43-2093', 'Tony', 'Hsu', 'tony@gmail.com', 'janitor'); -- Good
CALL add_employee('123-43-2093', 'Tony', 'Hsu', 'tony2@gmail.com', 'janitor'); -- SSN fails
CALL add_employee('123-43-2092', 'Tony', 'Hsu', 'tony@gmail.com', 'janitor'); -- Email fails

-- Tests deleting a product in the product table without deleting it first in contains and composed_of. 
CALL delete_product(101);
-- Tests deleting a product in the contains table. 
CALL delete_from_contains(101);
-- Tests deleting a product in the composed_if table. 
CALL delete_from_composed_of(101);
-- Tests deleting the product again in the product table after removing the row in the parent tables. 
CALL delete_product(101);

-- Tests deleting the contact_info in the product table without deleting it first in customer_order table. 
CALL delete_contact_info("adrian.s@zuma.test");
-- Tests deleting the contact_info in the customer_order table. 
CALL delete_from_customer_order("adrian.s@zuma.test");
-- Tests deleting the contact_info again in the customer_order table after removing the row in the parent table. 
CALL delete_contact_info("adrian.s@zuma.test");

CALL delete_employee(1);

-- Test the above procedure by changing the name of the crop, germ type, days in direct/indirect light, rack grow days and yield per tray.
CALL update_crop(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'stacked', 4, 5, 6, 111);

-- Test above procedure when an unvalid crop_id is provided
CALL update_crop(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'stacked', 4, 5, 6, 111);
-- Test above procedure when an unvalid sow_rate value ( <= 0) is provided
CALL update_crop(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 0, FALSE, 'stacked', 4, 5, 6, 111);	
-- Test above procedure when an unvalid yield_per_tray value ( <= 0) is provided
CALL update_crop(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'stacked', 4, 5, 6, 0);	
-- Test above procedure when an unvalid germination_type value is provided
CALL update_crop(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'test', 4, 5, 6, 111);	
-- Test above procedure when only some values are provided and some are left null
CALL update_crop(1, NULL, 'Amaranth, Red Garnet', 4, FALSE, 'stacked', NULL, NULL, NULL, 112);	
-- Test above procedure when THE crop_id provided is null
CALL update_crop(1, 'Amaranth TEST', 'Amaranth, Red Garnet', 4, FALSE, 'stacked', 4, 5, 6, 112);

-- Test above procedure by providing a new value to size_type
CALL update_packaging_table(4, 'A Test');
-- Test above procedure by providing null to size_type
CALL update_packaging_table(4, NULL);
-- Test above procedure by providing an invalid package_id
CALL update_packaging_table(200, 'A Test');
-- Test above procedure by providing an null value for package_id
CALL update_packaging_table(NULL, 'A Test');

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

CALL update_composed_of_table(102, 1, 0.5);
CALL update_composed_of_table(1000, 1, 0.5);
CALL update_composed_of_table(102, 1000, 0.5);

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

-- Test above procedure by updating all info fields for the given employee
CALL update_employee_table(2, '239-51-TEST', 'Liam TEST', 'Carter TEST', 'liam.carter@TEST.boston', 'Farm Manager TEST', TRUE);
-- Test above procedure by giving an invalid employee id
CALL update_employee_table(22222, '239-51-TEST', 'Liam TEST', 'Carter TEST', 'liam.carter@TEST.boston', 'Farm Manager TEST', TRUE);

-- Test reassigning an employee to plant crop 1 instead
CALL assign_employee_to_planting(6, 1);
-- Test assignging a new employee to plant a crop
CALL assign_employee_to_planting(7, 43);
-- Test providing invalid employee id
CALL assign_employee_to_planting(700, 43);
-- Test providing invalid crop id
CALL assign_employee_to_planting(7, 88);

-- Test Updating a delivery
CALL update_delivery('2025-12-02', 'cancelled', 2);

-- ADD A NEW ORDER IN MARCH
CALL add_order(1, 135, 10, 'weekly','2026-03-27', '2026-03-03','scheduled', 9); -- ALL OF MARCH
-- EDIT ONE ORDER AT THE START OF MARCH
CALL update_order(941, 'scheduled', 9, '2026-03-03', NULL, NULL, FALSE);
-- EDIT ONE ORDER AT THE START OF MARCH
CALL update_order(941, NULL, NULL, NULL, NULL, 99, FALSE);
-- UPDATE ALL ORDER IN MARCH
CALL update_order(941, NULL, NULL, '2026-03-04', NULL, NULL, TRUE);
-- UPDATE HALF OF MARCH
CALL update_order(943, NULL, NULL, '2026-04-08', NULL, NULL, TRUE);
-- UPDATE HALF OF MARCH
CALL update_order(944, NULL, NULL, '2025-11-25', NULL, NULL, TRUE);