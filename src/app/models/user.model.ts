export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  expiration: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}