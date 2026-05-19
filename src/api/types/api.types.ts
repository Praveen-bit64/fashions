export interface RegisterUserPayload {
    fullname: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginUserPayload {
    email: string;
    password: string;
}

export interface UpdateProfilePayload {
    name: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
