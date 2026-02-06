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

    private QuestaoService service;;

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
    
    /*         TERMINAR                 TERMINAR                          */
    /*         TERMINAR                 TERMINAR                          */
    /*         TERMINAR                 TERMINAR                          */
    /*         TERMINAR                 TERMINAR                          */
    /*         TERMINAR                 TERMINAR                          */
    
    public void editarQuestao() {
        try {
            System.out.println("\nInforme o ID da questão a ser editada: ");
            Long id = lerLong();

            Questao q = service.buscarPorId(id);

            System.out.println("\n=== Editando Questão " + q.getId() + " ===");
            System.out.println("Caso deseje que um valor seja mantido, aperte Enter\n");

            System.out.println("Enunciado atual: " + q.getEnunciado());
            System.out.println("Novo enunciado: ");
            String entrada = scanner.nextLine();
            if (!entrada.isBlank()) {
                q.setEnunciado(entrada);
            }

            System.out.println("Alternativa correta atual: " + q.getAlternativaCorreta());
            System.out.println("Nova alternativa correta: ");
            entrada = scanner.nextLine();
            if (!entrada.isBlank()) {
                q.setAlternativaCorreta(entrada);
            }

            System.out.println("Alternativa incorreta 1 atual: " + q.getAlternativaIncorreta1());
            System.out.println("Nova alternativa incorreta 1: ");
            entrada = scanner.nextLine();
            if (!entrada.isBlank()) {
                q.setAlternativaIncorreta1(entrada);
            }

            System.out.println("Alternativa incorreta 2 atual: " + q.getAlternativaIncorreta2());
            System.out.println("Nova alternativa incorreta 2: ");
            entrada = scanner.nextLine();
            if (!entrada.isBlank()) {
                q.setAlternativaIncorreta2(entrada);
            }

            System.out.println("Alternativa incorreta 3 atual: " + q.getAlternativaIncorreta3());
            System.out.println("Nova alternativa incorreta 3: ");
            entrada = scanner.nextLine();
            if (!entrada.isBlank()) {
                q.setAlternativaIncorreta3(entrada);
            }

            System.out.println("Materia atual: " + q.getMateria());
            System.out.println("Nova matéria: ");
            entrada = scanner.nextLine();
            if (!entrada.isBlank()) {
                q.setMateria(entrada);
            }

            System.out.println("Assunto atual: " + q.getAssunto());
            System.out.println("Novo Assunto: ");
            entrada = scanner.nextLine();
            if (!entrada.isBlank()) {
                q.setAssunto(entrada);
            }

            System.out.println("Fonte atual: " + q.getFonte());
            System.out.println("Nova fonte: ");
            entrada = scanner.nextLine();
            if (!entrada.isBlank()) {
                q.setFonte(entrada);
            }

            System.out.println("Dificuldade atual: " + getNomeDificuldade(q.getDificuldade()));
            System.out.println("Nova dificuldade: ");
            int novaDif = lerInt();
            if (novaDif != -1) {
                q.setDificuldade(novaDif);
            }

            service.atualizarQuestao(q);
            System.out.println("Questão atualizada!");

        } catch (IllegalArgumentException e) {
            System.out.println("\nErro: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("\nErro inesperado: " + e.getMessage());
        }
    }

    public void buscarPorMateria() {

        try {
            System.out.println("\nDigite a matéria a buscar:");
            String materia = scanner.nextLine();

            List<Questao> lista = service.buscarPorMateria(materia);

            if (lista.isEmpty()) {
                System.out.println("\nNenhuma questão encontrada para a matéria " + materia + "\n");
                return;
            }

            System.out.println("\n=== Questões de " + materia + " ===\n");
            for (Questao q : lista) {
                System.out.println("ID: " + q.getId());
                System.out.println("Enunciado: " + q.getEnunciado());
                System.out.println("Matéria: " + q.getMateria());
                System.out.println("Dificuldade: " + getNomeDificuldade(q.getDificuldade()));
                System.out.println("===\n");
            }
        } catch (IllegalArgumentException e) {
            System.out.println("\nErro: " + e.getMessage() + "\n");
        } catch (Exception e) {
            System.out.println("\nErro inesperado: " + e.getMessage() + "\n");
        }

    }

    public void buscarPorDificuldade() {

        try {
            System.out.println("\nEscolha a dificuldade desejada: ");
            System.out.println("\n 0 - Fácil");
            System.out.println("\n 1 - Média");
            System.out.println("\n 2 - Difícil");
            System.out.println("Digite a opção: ");

            Integer dificuldade = lerInt();

            List<Questao> lista = service.buscarPorDificuldade(dificuldade);

            if (lista.isEmpty()) {
                System.out.println("\nNenhuma questão encontrada para a dificuldade " + dificuldade + "\n");
                return;
            }

            System.out.println("\n=== Questões de dificuldade " + dificuldade + " ===\n");
            for (Questao q : lista) {
                System.out.println("ID: " + q.getId());
                System.out.println("Enunciado: " + q.getEnunciado());
                System.out.println("Matéria: " + q.getMateria());
                System.out.println("Dificuldade: " + getNomeDificuldade(q.getDificuldade()));
                System.out.println("===\n");
            }
        } catch (IllegalArgumentException e) {
            System.out.println("\nErro: " + e.getMessage() + "\n");
        } catch (Exception e) {
            System.out.println("\nErro inesperado: " + e.getMessage() + "\n");
        }
    }

    private Long lerLong() {
        while (!scanner.hasNextLong()) {
            System.out.println("Digite um número inteiro: ");
            scanner.next();
        }

        Long valor = scanner.nextLong();
        scanner.nextLine();
        return valor;
    }

    private int lerInt() {
        while (!scanner.hasNextLong()) {
            System.out.println("Digite um número inteiro: ");
            scanner.next();
        }

        int valor = scanner.nextInt();
        scanner.nextLine();
        return valor;
    }

    private String getNomeDificuldade(Integer dificuldade) {
        switch (dificuldade) {
            case 0:
                return "fácil";
            case 1:
                return "média";
            case 2:
                return "dificil";
            default:
                return "inválida";
        }
    }

}