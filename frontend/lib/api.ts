import { HabitRecord, AuthResponse, User}  from "@/types";

const API_BASE_URL = "http://127.0.0.1:8000";

const getToken = () =>{
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
}

//authentication
export const signUp = async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Failed to sign up");
    return response.json();
};


export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to log in");
    return response.json();
};




//habits
export const parseHabit = async (rawText: string): Promise<HabitRecord> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/habits/parse-habit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ raw_text: rawText }),
    });
    if (!response.ok) {
        {
    const errorDetails = await response.text();
    console.error("FastAPI 422 Details:", errorDetails);
    throw new Error('Failed to parse habit');
  }
    }
    return response.json();

};

export const fetchHabits = async (): Promise<HabitRecord[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/habits`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error("Failed to fetch habits");
    return response.json();
}