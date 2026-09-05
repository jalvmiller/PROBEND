package br.com.joaomu.dto.resolucao;

import br.com.joaomu.entity.Resolucao;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada para criação de Resolução.
 * Impede mass assignment de upvotes, autor, verificadoPorEspecialista ou seederContent.
 */
public record ResolucaoCreateRequest(
        @NotBlank(message = "O conteúdo da resolução é obrigatório")
        String conteudo,

        String trechoCodigo,

        String linguagemCodigo
) {
    /**
     * Converte o DTO validado para a entidade de domínio Resolucao.
     */
    public Resolucao toEntity() {
        Resolucao resolucao = new Resolucao();
        resolucao.setConteudo(this.conteudo);
        resolucao.setTrechoCodigo(this.trechoCodigo);
        resolucao.setLinguagemCodigo(this.linguagemCodigo);
        return resolucao;
    }
}
