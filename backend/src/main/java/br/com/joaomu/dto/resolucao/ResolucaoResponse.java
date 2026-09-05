package br.com.joaomu.dto.resolucao;

import br.com.joaomu.dto.auth.AutorResumoResponse;
import br.com.joaomu.entity.Resolucao;
import java.time.LocalDateTime;

/**
 * DTO de resposta pública para Resoluções de questões.
 * O campo 'id' identifica a Resolução para votação (upvote) e listagem de comentários.
 * O autor é transportado exclusivamente via AutorResumoResponse.
 */
public record ResolucaoResponse(
        Long id,
        String conteudo,
        String trechoCodigo,
        String linguagemCodigo,
        Integer upvotes,
        Boolean verificadoPorEspecialista,
        Integer qtdComentarios,
        LocalDateTime dataCriacao,
        boolean seederContent,
        AutorResumoResponse autor) {

    public static ResolucaoResponse fromEntity(Resolucao r) {
        if (r == null) {
            return null;
        }

        return new ResolucaoResponse(
                r.getId(),
                r.getConteudo(),
                r.getTrechoCodigo(),
                r.getLinguagemCodigo(),
                r.getUpvotes(),
                r.isVerificadoPorEspecialista(),
                r.getQtdComentarios(),
                r.getDataCriacao(),
                r.isSeederContent(),
                AutorResumoResponse.fromEntity(r.getAutor()));
    }
}
