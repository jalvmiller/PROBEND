package br.com.joaomu.dto.trilha;

public record ItemTrilhaResponse(
        Long id,
        Integer ordem,
        Long questaoId,
        String questaoTitulo,
        String materia,
        String assunto,
        Integer dificuldade,
        boolean concluido) {
}
