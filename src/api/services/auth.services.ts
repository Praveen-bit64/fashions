import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { ApiResponse } from "../types/api.response";
import {
    RegisterUserPayload,
    LoginUserPayload,
    UpdateProfilePayload,
    ChangePasswordPayload,
} from "../types/api.types";
import type { User } from "@/redux/slices/authSlice";

export const registerUser = (data: RegisterUserPayload) => {
    return apiClient.post<ApiResponse>(ENDPOINTS.REGISTER, data);
};

export const LoginUser = (data: LoginUserPayload) => {
    return apiClient.post<ApiResponse>(ENDPOINTS.LOGIN, data);
};

export const LogoutUser = () => {
    return apiClient.post<ApiResponse>(ENDPOINTS.LOGOUT);
};

export const FetchMe = () => {
    return apiClient.get<ApiResponse<User>>(ENDPOINTS.ME);
};

export const UpdateProfile = (data: UpdateProfilePayload) => {
    return apiClient.patch<ApiResponse<User>>(ENDPOINTS.UPDATE_PROFILE, data);
};

export const ChangePassword = (data: ChangePasswordPayload) => {
    return apiClient.post<ApiResponse>(ENDPOINTS.CHANGE_PASSWORD, data);
};
