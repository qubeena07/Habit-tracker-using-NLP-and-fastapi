export interface User{
    id: number;
    email: string;
}

export interface HabitRecord{
    id: number;
    user_input: string;
    parsed_category: string;
    quantity: number;
    created_at: string;
}

export interface AuthResponse{
    access_token: string;
    token_type: string;
}