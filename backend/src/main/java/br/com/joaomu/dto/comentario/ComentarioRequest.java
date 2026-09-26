package br.com.joaomu.dto.comentario;

import br.com.joaomu.entity.Comentario;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada para criação de Comentário em Resoluções.
 * Suporta comentários de nível raiz (paiId = null) ou respostas aninhadas
 * (paiId preenchido).
 */
public record ComentarioRequest(
        @NotBlank(message = "O conteúdo do comentário é obrigatório") String conteudo,
        Long paiId) {

    /**
     * Converte o DTO validado para a entidade de domínio Comentario.
     * A associação do pai e da resolução é gerenciada pelo Service.
     */
    public Comentario toEntity() {
        Comentario comentario = new Comentario();
        comentario.setConteudo(this.conteudo);
        return comentario;
    }
}
