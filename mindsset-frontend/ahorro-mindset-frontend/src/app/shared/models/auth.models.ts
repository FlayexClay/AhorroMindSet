export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  correo: string;
  nombre: string;
  apellidos: string;
  rol: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  correo: string;
  password: string;
}

export interface LoginRequest {
  correo: string;
  password: string;
}