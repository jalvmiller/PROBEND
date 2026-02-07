package br.com.joaomu.controller;

import br.com.joaomu.model.Questao;
import br.com.joaomu.service.QuestaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questoes")
@CrossOrigin("*")
public class QuestaoRestController {

    private QuestaoService service;

    public QuestaoRestController(QuestaoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Questao>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Questao> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Questao> criar(@RequestBody Questao questao) {
        Questao salva = service.validarQuestao(questao);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Questao> atualizar(@PathVariable Long id, @RequestBody Questao questao) {
        questao.setId(id);
        Questao atualizada = service.atualizarQuestao(questao);
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{ìd}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/materia/{materia}")
    public ResponseEntity<List<Questao>> buscarPorMateria(@PathVariable String materia) {
        List<Questao> questoes = service.buscarPorMateria(materia);
        return ResponseEntity.ok(questoes);
    }

    @GetMapping("/dificuldade/{dificuldade}")
    public ResponseEntity<List<Questao>> buscarPorDificuldade(@PathVariable Integer dificuldade) {
        List<Questao> questoes = service.buscarPorDificuldade(dificuldade);
        return ResponseEntity.ok(questoes);
    }

}