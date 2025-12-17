package br.com.joaomu;

import br.com.joaomu.model.Questao;
import br.com.joaomu.repo.QuestaoRepository;

import java.util.List;
import java.util.Scanner;

public class App {

    private static final Scanner scanner = new Scanner(System.in);
    private static final QuestaoRepository repo = new QuestaoRepository();

    public static void main(String[] args) {
        // Verif. do funcionamento da classe de repositório

        int opcao;

        do {
            System.out.println("\n=== Sistema de Questões ===");
            System.out.println("1 - Cadastrar questão");
            System.out.println("2 - Listar questões");
            System.out.println("3 - Remover questão");
            System.out.println("0 - Sair");
            System.out.print("Escolha uma opção: ");

            opcao = lerInt();

            switch (opcao) {
                case 1 -> cadastrarQuestao();
                case 2 -> listarQuestoes();
                case 3 -> removerQuestao();
                case 0 -> System.out.println("Saindo...");
                default -> System.out.println("Opção inválida!");
            }

        } while (opcao != 0);
    }

    private static void cadastrarQuestao() {
        Questao q = new Questao();

        System.out.print("Enunciado: ");
        q.setEnunciado(scanner.nextLine());

        System.out.print("Alternativa correta: ");
        q.setAlternativaCorreta(scanner.nextLine());

        System.out.print("Alternativa incorreta 1: ");
        q.setAlternativaIncorreta1(scanner.nextLine());

        System.out.print("Alternativa incorreta 2: ");
        q.setAlternativaIncorreta2(scanner.nextLine());

        System.out.print("Alternativa incorreta 3: ");
        q.setAlternativaIncorreta3(scanner.nextLine());

        System.out.print("Matéria: ");
        q.setMateria(scanner.nextLine());

        System.out.print("Assunto: ");
        q.setAssunto(scanner.nextLine());

        System.out.print("Dificuldade (0 fácil, 1 média, 2 difícil): ");
        q.setDificuldade(lerInt());

        System.out.print("Fonte: ");
        scanner.nextLine(); // consumir quebra de linha
        q.setFonte(scanner.nextLine());

        repo.salvar(q);

        System.out.println("Questão cadastrada com ID: " + q.getId());
    }

    private static void listarQuestoes() {
        List<Questao> lista = repo.listarTodas();
        if (lista.isEmpty()) {
            System.out.println("Nenhuma questão cadastrada.");
            return;
        }

        System.out.println("\n--- Questões ---");
        for (Questao q : lista) {
            System.out.println(q.getId() + " - " + q.getEnunciado());
        }
    }

    private static void removerQuestao() {
        System.out.print("Informe o ID da questão a remover: ");
        Long id = lerLong();

        boolean removido = repo.remover(id);
        if (removido) {
            System.out.println("Questão removida.");
        } else {
            System.out.println("ID não encontrado.");
        }
    }

    private static int lerInt() {
        while (!scanner.hasNextInt()) {
            System.out.print("Digite um número inteiro: ");
            scanner.next();
        }
        int valor = scanner.nextInt();
        scanner.nextLine(); // consumir quebra de linha
        return valor;
    }

    private static Long lerLong() {
        while (!scanner.hasNextLong()) {
            System.out.print("Digite um número inteiro: ");
            scanner.next();
        }
        Long valor = scanner.nextLong();
        scanner.nextLine(); // consumir quebra de linha
        return valor;
    }
}