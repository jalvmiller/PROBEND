package br.com.joaomu.dto;

/**
 * DTO de saída para dados de usuário.
 * Boas práticas, não expor hash BCrypt
 */
public record UsuarioResponse(
                Long id,
                String username,
                String nome,
                String email,
                String avatar,
                Integer pontos,
                boolean especialista,
                boolean administrador) {
}
