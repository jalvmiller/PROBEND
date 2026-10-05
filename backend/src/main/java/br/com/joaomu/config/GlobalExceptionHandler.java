package br.com.joaomu.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * manipulador global de exceções para a API REST.
 * Intercepta falhas de Bean Validation (@Valid) e retorna status 400 Bad
 * Request estruturado com os campos inválidos e
 * suas respectivas mensagens explicativas
 * 
 * Os campos com @Valid vão estar atrelados ao método de
 * handleValidationExceptions..
 * O Spring Boot detecta esse handler como interceptador global
 * no momento em que lê a anotação @RestControllerAdvice
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new HashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            campos.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("erro", "Dados inválidos");
        resposta.put("campos", campos);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resposta);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, String>> handleSecurityException(SecurityException ex) {
        Map<String, String> resposta = new HashMap<>();
        resposta.put("erro", "Acesso não autorizado");
        resposta.put("mensagem", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resposta);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> resposta = new HashMap<>();
        resposta.put("erro", "Requisição inválida");
        resposta.put("mensagem", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resposta);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, String> resposta = new HashMap<>();
        resposta.put("erro", "Operação inválida");
        resposta.put("mensagem", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resposta);
    }
}
