package br.com.joaomu.dto.trilha;

import br.com.joaomu.dto.auth.AutorResumoResponse;
import br.com.joaomu.entity.Trilha;
import java.time.LocalDateTime;
import java.util.List;

public record TrilhaResponse(
        Long id,
        String titulo,
        String descricao,
        boolean publica,
        LocalDateTime criadoEm,
        AutorResumoResponse autor,
        int totalQuestoes,
        int concluidas,
        boolean ativa,
        List<ItemTrilhaResponse> itens) {

    public static TrilhaResponse fromEntity(Trilha t, List<ItemTrilhaResponse> itens) {
        return fromEntity(t, itens, false, 0);
    }

    public static TrilhaResponse fromEntity(Trilha t, List<ItemTrilhaResponse> itens, boolean ativa, int concluidas) {
        if (t == null) {
            return null;
        }

        return new TrilhaResponse(
                t.getId(),
                t.getTitulo(),
                t.getDescricao(),
                t.isPublica(),
                t.getCriadoEm(),
                AutorResumoResponse.fromEntity(t.getAutor()),
                itens != null ? itens.size() : (t.getItens() != null ? t.getItens().size() : 0),
                concluidas,
                ativa,
                itens
        );
    }
}
