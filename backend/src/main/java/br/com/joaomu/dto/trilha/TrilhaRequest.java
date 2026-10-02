package br.com.joaomu.dto.trilha;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record TrilhaRequest(
        @NotBlank(message = "O título da trilha é obrigatório")
        String titulo,
        
        String descricao,
        
        Boolean publica,
        
        @NotEmpty(message = "A trilha deve conter ao menos uma questão")
        List<Long> questaoIds) {
}
