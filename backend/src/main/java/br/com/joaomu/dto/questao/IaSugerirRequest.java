package br.com.joaomu.dto.questao;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada para requisição de sugestão/rascunho de questão à IA Gemini.
 */
public record IaSugerirRequest(
        @NotBlank(message = "O prompt é obrigatório")
        String prompt,

        String rascunhoEnunciado
) {
}
