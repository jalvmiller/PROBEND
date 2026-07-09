package br.com.joaomu.controller;

import br.com.joaomu.model.Questao;
import br.com.joaomu.model.Resolucao;
import br.com.joaomu.service.QuestaoService;
import br.com.joaomu.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// RestController = Controller + ResponseBody
// Diz pro Spring que a classe lidará com requisições web e que o retorno
// dos métodos tem que ser escrito no corpo da resposta HTTP em formato JSON
// ao invés de renderizar um arquivo HTML
@RestController
// Define a rota base do Controller
@RequestMapping("/questoes")
@CrossOrigin("*")
public class QuestaoRestController {

    // Injeção de dependências
    private final QuestaoService service;
    private final GeminiService geminiService;

    // Responsabilidade do service é atuar como cérebro, controller só serve como
    // I/O
    public QuestaoRestController(QuestaoService service, GeminiService geminiService) {
        this.service = service;
        this.geminiService = geminiService;
    }

    // Listar todas trabalha com a busca
    @GetMapping
    public ResponseEntity<List<Questao>> listarTodas(@RequestParam(required = false) String busca) {
        if (busca != null && !busca.isBlank()) {
            return ResponseEntity.ok(service.buscarPorTermo(busca));
        }
        return ResponseEntity.ok(service.listarTodas());
    }
    // ============= Retorna HTTP 200 OK se a listagem ou a busca for bem sucedida

    @GetMapping("/{id}")
    public ResponseEntity<Questao> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }
    // @PathVariable captura variáveis da URL, o Spring injeta ${id} na variável id
    // ============= Retorna HTTP 200 OK se a busca for bem sucedida

    @PostMapping
    public ResponseEntity<Questao> criar(@RequestBody Questao questao) {
        Questao salva = service.validarQuestao(questao);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }
    // @RequestBody converte o body da requisição (vem em JSON) para um objeto Java
    // ============= Retorna 201 Created caso a criação ocorra normalmente

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Questao questao) {
        try {
            questao.setId(id);
            Questao atualizada = service.atualizarQuestao(questao);
            return ResponseEntity.ok(atualizada);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    // ============= Retorna 200 OK caso a atualização ocorra normalmente

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            service.remover(id);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    // ============= Retorna 204 No Content caso a remoção ocorra normalmente

    @GetMapping("/materia/{materia}")
    public ResponseEntity<List<Questao>> buscarPorMateria(@PathVariable String materia) {
        List<Questao> questoes = service.buscarPorMateria(materia);
        return ResponseEntity.ok(questoes);
    }
    // ============= Retorna 200 OK se a busca por matéria for bem sucedida

    @GetMapping("/dificuldade/{dificuldade}")
    public ResponseEntity<List<Questao>> buscarPorDificuldade(@PathVariable Integer dificuldade) {
        List<Questao> questoes = service.buscarPorDificuldade(dificuldade);
        return ResponseEntity.ok(questoes);
    }
    // ============= Retorna 200 OK se a busca por dificuldade for bem sucedida

    // o status é passado via request param, o ? é obrigatório
    // o status true ou false vem pelo ?status=
    // esse metodo é chamado quando o usuário logado clica no botão de marcar como
    // solucionada e só funciona se o usuario logado for o autor da questão
    @PutMapping("/{id}/solucionada")
    public ResponseEntity<Questao> marcarSolucionada(@PathVariable Long id, @RequestParam boolean status) {
        try {
            Questao atualizada = service.marcarComoSolucionada(id, status);
            return ResponseEntity.ok(atualizada);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    // ============= Retorna 200 OK caso a marcação de solucionada seja bem sucedida

    @GetMapping("/{id}/resolucoes")
    public ResponseEntity<List<Resolucao>> listarResolucoes(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarResolucoes(id));
    }
    // ============= Retorna 200 OK se a listagem de resoluções for bem sucedida

    @PostMapping("/{id}/resolucoes")
    public ResponseEntity<Resolucao> criarResolucao(@PathVariable Long id, @RequestBody Resolucao resolucao) {
        Resolucao salva = service.salvarResolucao(id, resolucao);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }
    // ============= Retorna 201 Created caso a criação seja bem sucedida

    // Retorna a sugestão/rascunho de questão gerado pela IA em JSON
    // (não-persistente)
    @PostMapping("/ia-sugerir")
    public ResponseEntity<String> iaSugerir(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        String rascunhoEnunciado = body.get("rascunhoEnunciado");
        String jsonResposta = geminiService.gerarSugestaoQuestao(prompt, rascunhoEnunciado);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(jsonResposta);
    }
    // ============= Retorna 200 OK se a sugestão de questão for bem sucedida

    // Gera e salva uma nova questão no banco a partir da ideia fornecida pela IA
    // (persistente)
    @PostMapping("/ia-criar-total")
    public ResponseEntity<?> iaCriarTotal(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
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
            Questao salva = service.validarQuestao(questao);
            return ResponseEntity.status(HttpStatus.CREATED).body(salva);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao processar e salvar a questão gerada pela IA: " + e.getMessage()));
        }
    }
    // ============= Retorna 201 Created caso a criação da questão seja bem sucedida

}