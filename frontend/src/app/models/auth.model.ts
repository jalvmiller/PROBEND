/**
 * Contratos de dados de Autenticação e Usuário
 * Espelhando exatamente as entidades e DTOs do Spring Boot (br.com.joaomu.dto / entity)
 */

export interface Usuario {
  id: number;
  username: string;
  nome: string;
  email: string;
  avatar?: string;
  pontos?: number;
  especialista?: boolean;
  administrador?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nome: string;
  email: string;
}

export interface AuthResponse {
  token: string;
}

