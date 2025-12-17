package br.com.joaomu;

import br.com.joaomu.model.Questao;
import br.com.joaomu.repo.QuestaoRepository;

public class AppList 
{
    public static void main( String[] args )
    {
        // Verif. do funcionamento da classe de repositório 

        QuestaoRepository repo = new QuestaoRepository();

        Questao questao1 = new Questao();
        questao1.setEnunciado("Quanto é 2 + 2?");
        questao1.setAlternativaCorreta("4");
        questao1.setAlternativaIncorreta1("3");
        questao1.setAlternativaIncorreta2("5");
        questao1.setAlternativaIncorreta3("22");
        questao1.setMateria("Matemática");
        questao1.setAssunto("Aritmética");
        questao1.setDificuldade(0);
        questao1.setFonte("Exemplo");

        repo.salvar(questao1);

        System.out.println("Questões cadastradas");

        for(Questao questao : repo.listarTodas()) {
            System.out.println(questao.getId() + " - " + questao.getEnunciado());
        }
    }
}
