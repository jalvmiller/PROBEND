package br.com.joaomu.dto.questao;

import br.com.joaomu.entity.Questao;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada para criação e atualização de Questão.
 * Blinda o domínio impedindo o recebimento de campos protegidos
 * (como seederContent, id, upvotes, solucionada e dataInsercao).
 */
public record QuestaoRequest(
        @NotBlank(message = "O enunciado é obrigatório")
        String enunciado,

        String imagemUrl,

        @NotBlank(message = "A matéria é obrigatória")
        String materia,

        String assunto,

        @Min(value = 0, message = "Dificuldade mínima é 0 (Fácil)")
        @Max(value = 2, message = "Dificuldade máxima é 2 (Difícil)")
        Integer dificuldade,

        String fonte,

        String trechoCodigo,

        String linguagemCodigo
) {
    /**
     * Converte o DTO validado para a entidade de domínio Questao.
     */
    public Questao toEntity() {
        Questao questao = new Questao();
        questao.setEnunciado(this.enunciado);
        questao.setImagemUrl(this.imagemUrl);
        questao.setMateria(this.materia);
        questao.setAssunto(this.assunto);
        questao.setDificuldade(this.dificuldade != null ? this.dificuldade : 0);
        questao.setFonte(this.fonte);
        questao.setTrechoCodigo(this.trechoCodigo);
        questao.setLinguagemCodigo(this.linguagemCodigo);
        return questao;
    }
}
