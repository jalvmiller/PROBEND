package br.com.joaomu.dto.auth;

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

    public static UsuarioResponse fromEntity(br.com.joaomu.entity.Usuario u) {
        if (u == null) {
            return null;
        }
        return new UsuarioResponse(
                u.getId(),
                u.getUsername(),
                u.getNome(),
                u.getEmail(),
                u.getAvatar(),
                u.getPontos(),
                u.isEspecialista(),
                u.isAdministrador());
    }
}
