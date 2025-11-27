export type OrderItem = {
    order_id: number;
    restaurant_id: number;
    product_id: number;
    product_name: string;
    package_type: string;
    quantity: number;
    order_status: string;
    employee_id: number;
    delivery_date: string;
    is_forced: boolean;
};

export type Restaurant = Record<string, OrderItem[]>;

export type RestaurantOption = {
    restaurant_id: number;
    restaurant_name: string;
}

export type DailyOrderItem = {
    product_name: string;
    package_info: string;
};