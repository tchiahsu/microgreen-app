export type ClientRow = {
    restaurant_id: number;
    restaurant_name: string;
    street_num: number | null;
    street_name: string;
    city: string;
    state: string;
    zip_code: string;
    is_active: boolean;
    contact_id: number;
    contact_name: string;
    email: string;
    phone: string;
    contact_address: string;
}