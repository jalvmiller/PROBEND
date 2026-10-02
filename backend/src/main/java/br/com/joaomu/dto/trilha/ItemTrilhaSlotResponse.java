package br.com.joaomu.dto.trilha;

public record ItemTrilhaSlotResponse(
        Long itemId,
        Integer numero,
        Long questaoId,
        String titulo,
        boolean concluida) {
}
