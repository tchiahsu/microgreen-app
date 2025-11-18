USE microgreens_db;

DROP VIEW IF EXISTS microgreens_view;
CREATE VIEW microgreens_view AS
	SELECT
		crop.crop_name,
        crop.days_indirect_light,
        crop.days_direct_light,
        crop.rack_grow_days,
        crop.yield_per_tray, 
		delivery.delivery_date,
        composed_of.crop_ratio,
        composed_of.crop_id,
        product.product_id,
        product.product_name,
        product.weight_grams,
        contains.quantity, 
        restaurant.restaurant_name, 
        customer_order.order_id,
        packaging.size_type, 
        CEILING(IFNULL(composed_of.crop_ratio * product.weight_grams * contains.quantity / crop.yield_per_tray, 1)) AS trays_needed,
        DATE_SUB(
			delivery.delivery_date, 
            INTERVAL (crop.days_indirect_light + crop.days_direct_light + crop.rack_grow_days) DAY
		) AS planting_date,
        DATE_SUB(
			delivery.delivery_date, 
            INTERVAL crop.rack_grow_days DAY
		) AS germination_date,
        DATE_SUB(
			delivery.delivery_date, 
            INTERVAL (crop.days_indirect_light + crop.rack_grow_days) DAY
        ) AS switch_date
        FROM crop
        JOIN composed_of ON crop.crop_id = composed_of.crop_id 
        JOIN product ON composed_of.product_id = product.product_id 
        JOIN contains ON contains.product_id = product.product_id
        JOIN customer_order ON customer_order.order_id = contains.order_id
        JOIN packaging ON product.package_id = packaging.package_id 
        JOIN delivery ON customer_order.delivery_date = delivery.delivery_date
        JOIN restaurant ON customer_order.restaurant_id = restaurant.restaurant_id
        ORDER BY delivery.delivery_date;
