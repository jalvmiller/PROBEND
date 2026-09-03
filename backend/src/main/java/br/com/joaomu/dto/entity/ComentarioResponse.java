package br.com.joaomu.dto.entity;

import br.com.joaomu.entity.Comentario;
import java.time.LocalDateTime;

/**
 * DTO de resposta pública para Comentários em resoluções.
 * Não expõe IDs de banco de dados nem chaves estrangeiras desnecessárias.
 */
public record ComentarioResponse(
        String conteudo,
        LocalDateTime dataCriacao,
        AutorResumoResponse autor) {

    public static ComentarioResponse fromEntity(Comentario c) {
        if (c == null) {
            return null;
        }

        return new ComentarioResponse(
                c.getConteudo(),
                c.getDataCriacao(),
                AutorResumoResponse.fromEntity(c.getAutor()));
        // DTO retorna só o necessário do Autor
    }
}
