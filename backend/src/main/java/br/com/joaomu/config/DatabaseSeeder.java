package br.com.joaomu.config;

import br.com.joaomu.model.Questao;
import br.com.joaomu.model.Resolucao;
import br.com.joaomu.model.User;
import br.com.joaomu.repo.QuestaoRepository;
import br.com.joaomu.repo.ResolucaoRepository;
import br.com.joaomu.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

	private final UserRepository userRepository;
	private final QuestaoRepository questaoRepository;
	private final ResolucaoRepository resolucaoRepository;
	private final PasswordEncoder passwordEncoder;

	public DatabaseSeeder(UserRepository userRepository,
			QuestaoRepository questaoRepository,
			ResolucaoRepository resolucaoRepository,
			PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.questaoRepository = questaoRepository;
		this.resolucaoRepository = resolucaoRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) throws Exception {
		// Roda o seed apenas se não existirem usuários no banco de dados
		if (userRepository.count() == 0) {
			System.out.println("=== Banco de dados vazio. Iniciando inserção dos dados seed... ===");

			// 1. Criar Usuários
			User admin = new User();
			admin.setUsername("admin");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setNome("Admin Probend");
			admin.setPontos(100);
			admin.setEspecialista(true);
			admin.setAdministrador(true);

			User especialista = new User();
			especialista.setUsername("especialista");
			especialista.setPassword(passwordEncoder.encode("especialista123"));
			especialista.setNome("Maria Especialista");
			especialista.setPontos(50);
			especialista.setEspecialista(true);
			especialista.setAdministrador(false);

			User user = new User();
			user.setUsername("user");
			user.setPassword(passwordEncoder.encode("user123"));
			user.setNome("João Aluno");
			user.setPontos(10);
			user.setEspecialista(false);
			user.setAdministrador(false);

			userRepository.saveAll(Arrays.asList(admin, especialista, user));
			System.out.println("Usuários de teste cadastrados!");

			// 2. Criar Questões de Teste
			Questao q1 = new Questao();
			q1.setEnunciado(
					"Dada a função f(x) = x² - 4x + 3, determine as raízes da função utilizando a fórmula de Bhaskara.");
			q1.setMateria("Matemática");
			q1.setAssunto("Funções");
			q1.setDificuldade(0); // Fácil
			q1.setFonte("Probend Vestibulares");
			q1.setAutor(user);

			Questao q2 = new Questao();
			q2.setEnunciado(
					"Escreva um método em Java que receba um array de inteiros e retorne a soma de todos os números pares.");
			q2.setMateria("Programação");
			q2.setAssunto("Algoritmos");
			q2.setDificuldade(1); // Médio
			q2.setFonte("Desafio Técnico");
			q2.setTrechoCodigo(
					"public int somarPares(int[] numeros) {\n    int soma = 0;\n    for(int num : numeros) {\n        if(num % 2 == 0) {\n            soma += num;\n        }\n    }\n    return soma;\n}");
			q2.setLinguagemCodigo("java");
			q2.setAutor(especialista);

			Questao q3 = new Questao();
			q3.setEnunciado(
					"Um objeto de massa 2 kg é abandonado a partir do repouso de uma altura de 20 metros. Desprezando a resistência do ar e adotando g = 10 m/s², calcule a velocidade do objeto imediatamente antes de tocar o solo.");
			q3.setMateria("Física");
			q3.setAssunto("Mecânica / Conservação de Energia");
			q3.setDificuldade(2); // Difícil
			q3.setFonte("FUVEST");
			q3.setAutor(admin);

			questaoRepository.saveAll(Arrays.asList(q1, q2, q3));
			System.out.println("Questões de teste cadastradas!");

			// 3. Criar Resoluções de Teste
			Resolucao r1 = new Resolucao();
			r1.setConteudo(
					"Para encontrar as raízes, fazemos f(x) = 0:\nx² - 4x + 3 = 0\n\nIdentificando os coeficientes:\na = 1, b = -4, c = 3\n\nCalculando o Delta (Δ):\nΔ = b² - 4ac\nΔ = (-4)² - 4(1)(3) = 16 - 12 = 4\n\nCalculando as raízes:\nx = (-b ± √Δ) / 2a\nx = (4 ± 2) / 2\n\nx1 = 3\nx2 = 1\n\nPortanto, as raízes são 1 e 3.");
			r1.setQuestao(q1);
			r1.setAutor(especialista);
			r1.setUpvotes(5);
			r1.setVerificadoPorEspecialista(true);

			Resolucao r2 = new Resolucao();
			r2.setConteudo("Também é possível resolver de forma concisa usando a Stream API do Java:");
			r2.setTrechoCodigo(
					"public int somarPares(int[] numeros) {\n    if (numeros == null) return 0;\n    return java.util.Arrays.stream(numeros)\n            .filter(n -> n % 2 == 0)\n            .sum();\n}");
			r2.setLinguagemCodigo("java");
			r2.setQuestao(q2);
			r2.setAutor(admin);
			r2.setUpvotes(8);
			r2.setVerificadoPorEspecialista(true);

			resolucaoRepository.saveAll(Arrays.asList(r1, r2));
			System.out.println("Resoluções de teste cadastradas!");

			System.out.println("=== Dados seed carregados com sucesso! ===");
		} else {
			System.out.println("Banco de dados já contém usuários. Pulando inicialização do seed.");
		}
	}
}
