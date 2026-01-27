package br.com.joaomu.controller;

import br.com.joaomu.model.*;
import br.com.joaomu.service.*;
import java.util.List;
import java.util.Scanner;

public class QuestaoController {

    private QuestaoService service;
    private Scanner scanner;

    public QuestaoController(QuestaoService service, Scanner scanner) {
        this.service = service;
        this.scanner = scanner;
    }

    public void cadastrarQuestao() {
        try {

            System.out.println("\n== Cadastro de questões ==");

            Questao q = new Questao();

            System.out.println("Enunciado: ");
            q.setEnunciado(scanner.nextLine());

            System.out.println("Alternativa Correta: ");
            q.setAlternativaCorreta(scanner.nextLine());

            System.out.println("Alternativa Incorreta 1: ");
            q.setAlternativaIncorreta1(scanner.nextLine());

            System.out.println("Alternativa Incorreta 2: ");
            q.setAlternativaIncorreta2(scanner.nextLine());

            System.out.println("Alternativa Incorreta 3: ");
            q.setAlternativaIncorreta3(scanner.nextLine());

            System.out.println("Matéria: ");
            q.setMateria(scanner.nextLine());

            System.out.println("Assunto: ");
            q.setAssunto(scanner.nextLine());

            System.out.println("Dificuldade: 0 - Fácil, 1 - Média, 2 - Difícil");
            q.setDificuldade(scanner.nextInt());

            System.out.println("Fonte: ");
            q.setFonte(scanner.nextLine());

            Questao salva = service.validarQuestao(q);

            System.out.println("Questao " + salva.getId() + " foi cadastrada com sucesso."); 
            // Controller -> Service -> Repo
            // E de repo, o objeto volta para que salva possa usar o getId

        } catch (IllegalArgumentException e) {
            System.out.println("\n ERRO: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("\n ERRO inesperado: " + e.getMessage());
        }
    }


    public void ListarQuestoes() {
        try {
            List<Questao> lista = service.listarTodas();

            if (lista.isEmpty()) {
                System.out.println("\nNenhuma questão cadastrada.");
                return;
            }

            System.out.println("\n=== Questões Cadastradas ===");
            for (Questao q : lista) {
                System.out.println("\n ID: " + q.getId());
                System.out.println("Enunciado: " + q.getEnunciado());
                System.out.println("Matéria: " + q.getMateria());
                System.out.println("Dificuldade" + q.getDificuldade());
                System.out.println("---");
            }
        } catch (Exception e) {
            System.out.println("\n Erro ao listar questões: " + e.getMessage());
        }
    }


    public void removerQuestao() {
        try {
            System.out.println("Informe o ID da questão: ");
            Long id = lerLong();

            service.remover(id);
            System.out.println("\nQuestão removida.");

        } catch (IllegalArgumentException e) {
            System.out.println("\nErro: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("\nErro Ineseperado: " + e.getMessage());
        }
    }


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


    private Long lerLong(){
        while (!scanner.hasNextLong()) {
            System.out.println("Digite um número inteiro: ");
            scanner.next();
        }

        Long valor = scanner.nextLong();
        scanner.nextLine();
        return valor;
    }


    private int lerInt(){
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
            case 0: return "fácil";
            case 1: return "média";
            case 2: return "dificil";
            default: return "inválida";
        }
    }

}