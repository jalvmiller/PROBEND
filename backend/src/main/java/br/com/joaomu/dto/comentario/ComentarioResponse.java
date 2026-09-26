package br.com.joaomu.dto.comentario;

import br.com.joaomu.dto.auth.AutorResumoResponse;
import br.com.joaomu.entity.Comentario;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO de resposta pública para Comentários em resoluções
 * O campo 'id' e 'paiId' identificam o nó na
 * árvore e viabilizam respostas
 * aninhadas e colapso no frontend.
 * O autor é transportado exclusivamente via AutorResumoResponse
 */
public record ComentarioResponse(
        Long id,
        Long paiId,
        String conteudo,
        LocalDateTime dataCriacao,
        AutorResumoResponse autor,
        List<ComentarioResponse> respostas) {

    /**
     * Converte a entidade Comentario para ComentarioResponse com lista de respostas
     * inicializada.
     */
    public static ComentarioResponse fromEntity(Comentario c) {
        if (c == null) {
            return null;
        }

        return new ComentarioResponse(
                c.getId(),
                c.getPaiId(),
                c.getConteudo(),
                c.getDataCriacao(),
                AutorResumoResponse.fromEntity(c.getAutor()),
                new ArrayList<>());
    }

    /**
     * Retorna uma nova instância associando a lista de respostas filhas montada.
     */
    public ComentarioResponse withRespostas(List<ComentarioResponse> respostas) {
        return new ComentarioResponse(
                this.id,
                this.paiId,
                this.conteudo,
                this.dataCriacao,
                this.autor,
                respostas != null ? respostas : new ArrayList<>());
    }
}
