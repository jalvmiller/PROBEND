package br.com.joaomu;

import br.com.joaomu.controller.*;
import br.com.joaomu.repo.QuestaoRepository;
import br.com.joaomu.service.QuestaoService;
import br.com.joaomu.view.*;

import java.util.Scanner;

public class App {

    public static void main(String[] args) {
        // Verif. do funcionamento
        Scanner scanner = new Scanner(System.in);
        QuestaoRepository repository = new QuestaoRepository();
        QuestaoService service = new QuestaoService(repository);
        QuestaoController controller = new QuestaoController(service, scanner);
        MenuView menu = new MenuView(scanner);

        executarAplicacao(controller, menu);
        scanner.close();
    }



    private static void executarAplicacao(QuestaoController controller, MenuView menu) {
        int opcao;

        do {
            opcao = menu.exibirMenuPrincipal();

            switch(opcao) {
                case 1:
                    controller.cadastrarQuestao();
                    break;
                case 2:
                    controller.ListarQuestoes();
                    break;
                case 3:
                    controller.editarQuestao();
                    break;
                case 4:
                    controller.removerQuestao();
                    break;
                case 5: 
                    controller.buscarPorMateria();
                    break;
                case 6:
                    controller.buscarPorDificuldade();
                    break;
                case 0:
                    menu.exibirInformacao("Encerrando...");
                    break;
                default:
                    menu.exibirErro("Opção inválida!");
            }



            if (opcao != 0) {
                menu.standby();
            }
            


        } while (opcao != 0);
    }
}