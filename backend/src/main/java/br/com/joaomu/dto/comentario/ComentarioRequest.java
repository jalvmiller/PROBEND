package br.com.joaomu.dto.comentario;

import br.com.joaomu.entity.Comentario;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada para criação de Comentário em Resoluções.
 */
public record ComentarioRequest(
        @NotBlank(message = "O conteúdo do comentário é obrigatório") String conteudo) {

    /**
     * Converte o DTO validado para a entidade de domínio Comentario.
     */
    public Comentario toEntity() {
        Comentario comentario = new Comentario();
        comentario.setConteudo(this.conteudo);
        return comentario;
    }
}
