package br.com.joaomu.dto.perfil;

import br.com.joaomu.entity.Comentario;
import br.com.joaomu.entity.Questao;
import br.com.joaomu.entity.Resolucao;
import java.time.LocalDateTime;

/**
 * DTO de resposta para os comentários postados pelo usuário logado (exibição na Sidebar e Perfil).
 * Concatena o texto do comentário com os identificadores e enunciado da questão vinculada.
 */
public record MeuComentarioResponse(
        Long id,
        String conteudo,
        LocalDateTime dataCriacao,
        Long resolucaoId,
        Long questaoId,
        String questaoEnunciado) {

    public static MeuComentarioResponse fromEntity(Comentario c) {
        if (c == null) {
            return null;
        }

        Resolucao r = c.getResolucao();
        Questao q = (r != null) ? r.getQuestao() : null;

        return new MeuComentarioResponse(
                c.getId(),
                c.getConteudo(),
                c.getDataCriacao(),
                r != null ? r.getId() : null,
                q != null ? q.getId() : null,
                q != null ? q.getEnunciado() : null);
    }
}
