package br.com.joaomu.controller;

import br.com.joaomu.dto.questao.QuestaoResponse;
import br.com.joaomu.dto.questao.IaCriarRequest;
import br.com.joaomu.dto.questao.IaSugerirRequest;
import br.com.joaomu.entity.Questao;
import br.com.joaomu.service.QuestaoService;
import br.com.joaomu.service.integration.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// RestController especializado nas funcionalidades de IA (Gemini) para Questões
@RestController
@RequestMapping("/questoes")
public class IaQuestaoRestController {

    private final GeminiService geminiService;
    private final QuestaoService questaoService;

    public IaQuestaoRestController(GeminiService geminiService, QuestaoService questaoService) {
        this.geminiService = geminiService;
        this.questaoService = questaoService;
    }

    // Retorna a sugestão/rascunho de questão gerado pela IA em JSON
    // (não-persistente)
    @PostMapping("/ia-sugerir")
    public ResponseEntity<String> iaSugerir(@Valid @RequestBody IaSugerirRequest dto) {
        String prompt = dto.prompt();
        String rascunhoEnunciado = dto.rascunhoEnunciado() != null ? dto.rascunhoEnunciado() : "";
        String jsonResposta = geminiService.gerarSugestaoQuestao(prompt, rascunhoEnunciado);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(jsonResposta);
    }

    // Gera e salva uma nova questão no banco a partir da ideia fornecida pela IA
    // (persistente)
    @PostMapping("/ia-criar-total")
    public ResponseEntity<?> iaCriarTotal(@Valid @RequestBody IaCriarRequest dto) {
        String prompt = dto.prompt();
        String jsonResposta = geminiService.gerarSugestaoQuestao(prompt, "");
        try {
            // Mapper é usado pra converter JSON em objeto Java,
            // ele cria uma instância de classe Questao
            // preenche seus atributos com os valores do JSON.
            // No GeminiService há o processo inverso,
            // ele pega o mapa Java (requestBody) e converte em texto JSON
            // antes de enviar pro Gemini
            ObjectMapper mapper = new ObjectMapper();
            Questao questao = mapper.readValue(jsonResposta, Questao.class);
            Questao salva = questaoService.validarQuestao(questao);
            return ResponseEntity.status(HttpStatus.CREATED).body(QuestaoResponse.fromEntity(salva));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao processar e salvar a questão gerada pela IA: " + e.getMessage()));
        }
    }
}
