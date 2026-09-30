package br.com.joaomu.dto.perfil;

import br.com.joaomu.entity.Questao;
import br.com.joaomu.entity.Resolucao;
import java.time.LocalDateTime;

/**
 * DTO de resposta para as resoluções postadas pelo usuário logado (exibição na Sidebar e Perfil).
 * Concatena os dados essenciais da resolução aos dados da questão relacionada para navegação.
 */
public record MinhaResolucaoResponse(
        Long id,
        String conteudo,
        String trechoCodigo,
        String linguagemCodigo,
        Integer upvotes,
        Boolean verificadoPorEspecialista,
        Integer qtdComentarios,
        LocalDateTime dataCriacao,
        Long questaoId,
        String questaoEnunciado,
        String questaoMateria) {

    public static MinhaResolucaoResponse fromEntity(Resolucao r) {
        if (r == null) {
            return null;
        }

        Questao q = r.getQuestao();

        return new MinhaResolucaoResponse(
                r.getId(),
                r.getConteudo(),
                r.getTrechoCodigo(),
                r.getLinguagemCodigo(),
                r.getUpvotes(),
                r.isVerificadoPorEspecialista(),
                r.getQtdComentarios(),
                r.getDataCriacao(),
                q != null ? q.getId() : null,
                q != null ? q.getEnunciado() : null,
                q != null ? q.getMateria() : null);
    }
}
