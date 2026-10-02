package br.com.joaomu.dto.trilha;

import java.util.List;

public record TrilhaAtivaResponse(
        Long trilhaId,
        String titulo,
        int totalQuestoes,
        int concluidas,
        List<ItemTrilhaSlotResponse> slots) {
}
