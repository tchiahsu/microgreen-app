export type DeliveryItem = {
    delivery_date: string;
    delivery_status: string;
    employee_id?: number | null;
    first_name?: string | null;
    last_name?: string | null;
    assigned_driver?: string;
}