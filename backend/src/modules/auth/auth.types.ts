export interface LoginRequest {
  email: string;
  password: string;
  requestedRole?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}