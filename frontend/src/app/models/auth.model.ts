/**
 * Contrato de dados de Usuário, espelhando as entidades do Spring Boot
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'ADMIN' | 'MODERADOR' | 'USUARIO';
}
