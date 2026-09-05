package br.com.joaomu.dto.questao;

import br.com.joaomu.dto.auth.AutorResumoResponse;
import br.com.joaomu.entity.Questao;
import java.time.LocalDateTime;

/**
 * DTO de resposta pública para Questões.
 * O campo 'id' identifica a Questão na URL pública e em ações do React.
 * O autor é transportado exclusivamente via AutorResumoResponse,
 * sem vazar e-mail, senha, roles ou ID de usuário.
 */
public record QuestaoResponse(
        Long id,
        String enunciado,
        String imagemUrl,
        String materia,
        String assunto,
        Integer dificuldade,
        String fonte,
        String trechoCodigo,
        String linguagemCodigo,
        Boolean solucionada,
        LocalDateTime dataInsercao,
        Integer upvotes,
        boolean seederContent,
        AutorResumoResponse autor) {

    public static QuestaoResponse fromEntity(Questao q) {
        if (q == null) {
            return null;
        }

        return new QuestaoResponse(
                q.getId(),
                q.getEnunciado(),
                q.getImagemUrl(),
                q.getMateria(),
                q.getAssunto(),
                q.getDificuldade(),
                q.getFonte(),
                q.getTrechoCodigo(),
                q.getLinguagemCodigo(),
                q.isSolucionada(),
                q.getDataInsercao(),
                q.getUpvotes(),
                q.isSeederContent(),
                AutorResumoResponse.fromEntity(q.getAutor()));
    }
}
