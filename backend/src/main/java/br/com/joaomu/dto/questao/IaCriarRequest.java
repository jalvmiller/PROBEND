package br.com.joaomu.dto.questao;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada para geração e persistência automática de questão via IA
 * Gemini.
 */
public record IaCriarRequest(
                @NotBlank(message = "O prompt é obrigatório") String prompt) {
}
