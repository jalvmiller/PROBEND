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
            System.out.println("4 - Editar questão");
            System.out.println("0 - Sair");
            System.out.print("Escolha uma opção: ");

            opcao = lerInt();

            switch (opcao) {
                case 1 -> cadastrarQuestao();
                case 2 -> listarQuestoes();
                case 3 -> removerQuestao();
                case 4 -> editarQuestao();
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

    private static void editarQuestao() {
        System.out.print("Informe o ID da questão a editar: ");
        Long id = lerLong();

        Questao q = repo.buscarPorId(id);
        if (q == null) {
            System.out.println("ID não encontrado.");
            return;
        }

        System.out.println("\nEditando questão " + q.getId());
        System.out.println("Deixe em branco para manter o valor atual.\n");

        System.out.println("Enunciado atual: " + q.getEnunciado());
        System.out.print("Novo enunciado: ");
        String entrada = scanner.nextLine();
        if (!entrada.isBlank()) {
            q.setEnunciado(entrada);
        }

        System.out.println("Alternativa correta atual: " + q.getAlternativaCorreta());
        System.out.print("Nova alternativa correta: ");
        entrada = scanner.nextLine();
        if (!entrada.isBlank()) {
            q.setAlternativaCorreta(entrada);
        }

        System.out.println("Alternativa incorreta 1 atual: " + q.getAlternativaIncorreta1());
        System.out.print("Nova alternativa incorreta 1: ");
        entrada = scanner.nextLine();
        if (!entrada.isBlank()) {
            q.setAlternativaIncorreta1(entrada);
        }

        System.out.println("Alternativa incorreta 2 atual: " + q.getAlternativaIncorreta2());
        System.out.print("Nova alternativa incorreta 2: ");
        entrada = scanner.nextLine();
        if (!entrada.isBlank()) {
            q.setAlternativaIncorreta2(entrada);
        }

        System.out.println("Alternativa incorreta 3 atual: " + q.getAlternativaIncorreta3());
        System.out.print("Nova alternativa incorreta 3: ");
        entrada = scanner.nextLine();
        if (!entrada.isBlank()) {
            q.setAlternativaIncorreta3(entrada);
        }

        System.out.println("Matéria atual: " + q.getMateria());
        System.out.print("Nova matéria: ");
        entrada = scanner.nextLine();
        if (!entrada.isBlank()) {
            q.setMateria(entrada);
        }

        System.out.println("Assunto atual: " + q.getAssunto());
        System.out.print("Novo assunto: ");
        entrada = scanner.nextLine();
        if (!entrada.isBlank()) {
            q.setAssunto(entrada);
        }

        System.out.println("Dificuldade atual: " + q.getDificuldade() + " (0 fácil, 1 média, 2 difícil)");
        System.out.print("Nova dificuldade (ou -1 para manter): ");
        int novaDif = lerInt();
        if (novaDif != -1) {
            q.setDificuldade(novaDif);
        }

        System.out.println("Fonte atual: " + q.getFonte());
        System.out.print("Nova fonte: ");
        entrada = scanner.nextLine();
        if (!entrada.isBlank()) {
            q.setFonte(entrada);
        }

        // como o objeto já está na lista, basta chamar salvar para manter a lógica
        // consistente
        repo.salvar(q);

        System.out.println("Questão atualizada.");
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