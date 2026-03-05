export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
}

export interface EmergencyContact {
    name: string;
    relation: string;
    phone: string;
}

export interface CreateStudentRequest {
    // Academic
    language: string;
    level: string;
    teacherId: string;

    // Identity
    name: string;
    email: string;
    studentId: string; // Custom student ID provided on form

    // Demographics
    dob: string;
    gender: string;

    // Contact
    phone: string;
    address: Address;
    emergencyContact: EmergencyContact;

    // Billing
    status: "paid" | "unpaid";
}
