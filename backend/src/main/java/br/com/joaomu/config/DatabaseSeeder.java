package br.com.joaomu.config;

import br.com.joaomu.entity.Questao;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.repository.QuestaoRepository;
import br.com.joaomu.repository.ResolucaoRepository;
import br.com.joaomu.repository.UsuarioRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

	private final UsuarioRepository usuarioRepository;
	private final QuestaoRepository questaoRepository;
	private final ResolucaoRepository resolucaoRepository;
	private final PasswordEncoder passwordEncoder;

	public DatabaseSeeder(UsuarioRepository usuarioRepository,
			QuestaoRepository questaoRepository,
			ResolucaoRepository resolucaoRepository,
			PasswordEncoder passwordEncoder) {
		this.usuarioRepository = usuarioRepository;
		this.questaoRepository = questaoRepository;
		this.resolucaoRepository = resolucaoRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) throws Exception {
		// Roda o seed apenas se não existirem usuários no banco de dados
		if (usuarioRepository.count() == 0) {
			System.out.println("=== Banco de dados vazio. Iniciando inserção dos dados seed... ===");

			// 1. Criar Usuários
			Usuario admin = new Usuario();
			admin.setUsername("admin");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setNome("Admin Probend");
			admin.setEmail("admin@probend.com");
			admin.setAvatar("https://i.pravatar.cc/150?u=admin");
			admin.setPontos(100);
			admin.setEspecialista(true);
			admin.setAdministrador(true);

			Usuario especialista = new Usuario();
			especialista.setUsername("especialista");
			especialista.setPassword(passwordEncoder.encode("especialista123"));
			especialista.setNome("Maria Especialista");
			especialista.setEmail("especialista@probend.com");
			especialista.setAvatar("https://i.pravatar.cc/150?u=especialista");
			especialista.setPontos(50);
			especialista.setEspecialista(true);
			especialista.setAdministrador(false);

			Usuario user = new Usuario();
			user.setUsername("user");
			user.setPassword(passwordEncoder.encode("user123"));
			user.setNome("João Aluno");
			user.setEmail("user@probend.com");	
			user.setPontos(10);
			user.setEspecialista(false);
			user.setAdministrador(false);

			usuarioRepository.saveAll(Arrays.asList(admin, especialista, user));
			System.out.println("Usuários de teste cadastrados!");

			// 2. Criar Questões de Teste
			Questao q1 = new Questao();
			q1.setEnunciado(
					"Dada a função $f(x) = x^2 - 4x + 3$, determine as raízes da função utilizando a fórmula de Bhaskara.");
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
					"Um objeto de massa $2\\text{ kg}$ é abandonado a partir do repouso de uma altura de $20\\text{ metros}$. Desprezando a resistência do ar e adotando $g = 10\\text{ m/s}^2$, calcule a velocidade do objeto imediatamente antes de tocar o solo.");
			q3.setMateria("Física");
			q3.setAssunto("Mecânica / Conservação de Energia");
			q3.setDificuldade(2); // Difícil
			q3.setFonte("FUVEST");
			q3.setAutor(admin);

			Questao q4 = new Questao();
			q4.setEnunciado(
					"Dadas as matrizes $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ e $B = \\begin{pmatrix} 2 & 0 \\\\ 1 & 3 \\end{pmatrix}$, calcule o determinante do produto das matrizes, ou seja, $\\det(A \\cdot B)$. Dica: utilize a propriedade $\\det(A \\cdot B) = \\det(A) \\cdot \\det(B)$.");
			q4.setMateria("Matemática");
			q4.setAssunto("Álgebra Linear / Matrizes");
			q4.setDificuldade(1); // Médio
			q4.setFonte("Probend Vestibulares");
			q4.setAutor(user);

			Questao q5 = new Questao();
			q5.setEnunciado(
					"Determine a integral definida $\\int_{0}^{\\pi} \\sin(x) \\, dx$. Apresente o passo a passo da integração utilizando o Teorema Fundamental do Cálculo.");
			q5.setMateria("Matemática");
			q5.setAssunto("Cálculo Integral");
			q5.setDificuldade(1); // Médio
			q5.setFonte("Probend Cálculo I");
			q5.setAutor(admin);

			Questao q6 = new Questao();
			q6.setEnunciado(
					"Analise a complexidade de tempo do algoritmo abaixo no pior caso utilizando a notação Big-O. Justifique sua resposta indicando a relação matemática correspondente ao número de iterações do laço externo e interno, expressa como uma soma:\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n\nQual é a complexidade assintótica $O(f(n))$?");
			q6.setTrechoCodigo(
					"public void loopExemplo(int n) {\n    for (int i = 0; i < n; i++) {\n        for (int j = i; j < n; j++) {\n            System.out.println(\"i: \" + i + \", j: \" + j);\n        }\n    }\n}");
			q6.setLinguagemCodigo("java");
			q6.setMateria("Programação");
			q6.setAssunto("Análise de Algoritmos");
			q6.setDificuldade(1); // Médio
			q6.setFonte("Estruturas de Dados");
			q6.setAutor(admin);

			Questao q7 = new Questao();
			q7.setEnunciado(
					"Considere a função recursiva abaixo que calcula a potência $a^n$ de forma eficiente (exponenciação rápida). Determine a relação de recorrência para o tempo de execução $T(n)$ e a complexidade assintótica correspondente em termos de $n$ utilizando a base de logaritmo base 2, ou seja, $O(\\log_2 n)$.");
			q7.setTrechoCodigo(
					"public double fastPower(double a, int n) {\n    if (n == 0) return 1;\n    double half = fastPower(a, n / 2);\n    if (n % 2 == 0) {\n        return half * half;\n    } else {\n        return a * half * half;\n    }\n}");
			q7.setLinguagemCodigo("java");
			q7.setMateria("Programação");
			q7.setAssunto("Recursão / Divisão e Conquista");
			q7.setDificuldade(2); // Difícil
			q7.setFonte("MIT Introduction to Algorithms");
			q7.setAutor(especialista);

			Questao q8 = new Questao();
			q8.setEnunciado(
					"Determine os valores de $x$ no intervalo $[0, 2\\pi]$ que satisfazem a equação trigonométrica:\n$$\\sin^2(x) - 3\\sin(x) + 2 = 0$$");
			q8.setMateria("Matemática");
			q8.setAssunto("Trigonometria");
			q8.setDificuldade(1); // Médio
			q8.setFonte("FUVEST");
			q8.setAutor(admin);

			Questao q9 = new Questao();
			q9.setEnunciado(
					"Sejam dois eventos independentes $A$ e $B$ com probabilidades $P(A) = 0.4$ e $P(B) = 0.5$. Calcule a probabilidade da união dos eventos, ou seja, $P(A \\cup B)$, utilizando a fórmula:\n$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$");
			q9.setMateria("Matemática");
			q9.setAssunto("Probabilidade");
			q9.setDificuldade(0); // Fácil
			q9.setFonte("Probend Vestibulares");
			q9.setAutor(especialista);

			Questao q10 = new Questao();
			q10.setEnunciado(
					"Um cone circular reto de raio da base $R$ e altura $H$ é seccionado por um plano paralelo à base a uma distância $h$ do vértice. Determine a razão entre o volume do cone menor $V_1$ e o volume do cone original $V_2$ em função da razão de suas alturas, sabendo que:\n$$V = \\frac{1}{3}\\pi r^2 h$$");
			q10.setMateria("Matemática");
			q10.setAssunto("Geometria Espacial");
			q10.setDificuldade(2); // Difícil
			q10.setFonte("ITA");
			q10.setAutor(admin);

			Questao q11 = new Questao();
			q11.setEnunciado(
					"Dada a definição recursiva dos números de Fibonacci com memoização, o tempo de execução é otimizado de $O(2^n)$ para $O(n)$. Explique como a tabela de memoização altera a árvore de recursão e qual a complexidade de espaço adicional $S(n)$ gerada pela pilha de chamadas e pela tabela.");
			q11.setTrechoCodigo(
					"public int fib(int n, int[] memo) {\n    if (n <= 1) return n;\n    if (memo[n] != 0) return memo[n];\n    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n    return memo[n];\n}");
			q11.setLinguagemCodigo("java");
			q11.setMateria("Programação");
			q11.setAssunto("Programação Dinâmica");
			q11.setDificuldade(2); // Difícil
			q11.setFonte("Cracking the Coding Interview");
			q11.setAutor(especialista);

			Questao q12 = new Questao();
			q12.setEnunciado(
					"Em uma Árvore Binária de Busca (BST), a inserção de um elemento tem complexidade média de $O(\\log_2 n)$. No entanto, no pior caso, a árvore pode se tornar degenerada (como uma lista encadeada). Descreva qual a complexidade no pior caso para buscar um elemento e qual estrutura de dados de árvore auto-balanceada (por exemplo, AVL ou Rubro-Negra) garante complexidade $O(\\log n)$ para busca, inserção e remoção no pior caso.");
			q12.setMateria("Programação");
			q12.setAssunto("Estruturas de Dados");
			q12.setDificuldade(1); // Médio
			q12.setFonte("Desafio de Algoritmos");
			q12.setAutor(admin);

			questaoRepository.saveAll(Arrays.asList(q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12));
			System.out.println("Questões de teste cadastradas!");

			// 3. Criar Resoluções de Teste
			Resolucao r1 = new Resolucao();
			r1.setConteudo(
					"Para encontrar as raízes, fazemos $f(x) = 0$:\n$$x^2 - 4x + 3 = 0$$\n\nIdentificando os coeficientes:\n$a = 1$, $b = -4$, $c = 3$\n\nCalculando o Delta ($\\Delta$):\n$$\\Delta = b^2 - 4ac$$\n$$\\Delta = (-4)^2 - 4(1)(3) = 16 - 12 = 4$$\n\nCalculando as raízes:\n$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$\n$$x = \\frac{4 \\pm 2}{2}$$\n\n$$x_1 = 3$$\n$$x_2 = 1$$\n\nPortanto, as raízes são $1$ e $3$.");
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

			Resolucao rP = new Resolucao();
			rP.setConteudo(
					"Podemos resolver o problema por conservação de energia ou pelas equações de Torricelli:\n\nComo o objeto parte do repouso ($v_0 = 0\\text{ m/s}$) de uma altura $h = 20\\text{ m}$ sob aceleração da gravidade $g = 10\\text{ m/s}^2$, temos:\n$$v^2 = v_0^2 + 2g\\Delta s$$\n$$v^2 = 0^2 + 2(10)(20)$$\n$$v^2 = 400$$\n$$v = \\sqrt{400} = 20\\text{ m/s}$$\n\nPortanto, a velocidade do objeto imediatamente antes de tocar o solo é $20\\text{ m/s}$.");
			rP.setQuestao(q3);
			rP.setAutor(admin);
			rP.setUpvotes(6);
			rP.setVerificadoPorEspecialista(true);

			Resolucao r3 = new Resolucao();
			r3.setConteudo(
					"Podemos calcular os determinantes individualmente:\n\n1. Determinante de $A$:\n$$\\det(A) = 1 \\cdot 4 - 2 \\cdot 3 = 4 - 6 = -2$$\n\n2. Determinante de $B$:\n$$\\det(B) = 2 \\cdot 3 - 0 \\cdot 1 = 6 - 0 = 6$$\n\n3. Utilizando o teorema de Cauchy (propriedade do produto):\n$$\\det(A \\cdot B) = \\det(A) \\cdot \\det(B) = (-2) \\cdot 6 = -12$$\n\nPortanto, o determinante do produto é $-12$.");
			r3.setQuestao(q4);
			r3.setAutor(especialista);
			r3.setUpvotes(4);
			r3.setVerificadoPorEspecialista(true);

			Resolucao r4 = new Resolucao();
			r4.setConteudo(
					"Para resolver a integral definida $\\int_{0}^{\\pi} \\sin(x) \\, dx$, seguimos os seguintes passos:\n\n1. Encontramos a primitiva de $f(x) = \\sin(x)$, que é $F(x) = -\\cos(x)$.\n\n2. Aplicamos os limites de integração de $0$ a $\\pi$:\n$$\\int_{0}^{\\pi} \\sin(x) \\, dx = [-\\cos(x)]_{0}^{\\pi}$$\n\n3. Substituímos os limites superior e inferior:\n$$= -\\cos(\\pi) - (-\\cos(0))$$\n$$= -(-1) - (-1) = 1 + 1 = 2$$\n\nPortanto, o valor da integral é $2$.");
			r4.setQuestao(q5);
			r4.setAutor(especialista);
			r4.setUpvotes(7);
			r4.setVerificadoPorEspecialista(true);

			Resolucao r5 = new Resolucao();
			r5.setConteudo(
					"No algoritmo apresentado:\n\n1. O laço externo executa $n$ vezes (de $i = 0$ até $n-1$).\n2. Para cada $i$, o laço interno executa de $j = i$ até $n-1$, o que equivale a $n - i$ iterações.\n\nPortanto, o número total de execuções da instrução interna é a soma:\n$$T(n) = n + (n - 1) + (n - 2) + \\dots + 1 = \\sum_{i=1}^{n} i$$\n\nUsando a fórmula da soma da PA:\n$$T(n) = \\frac{n(n + 1)}{2} = \\frac{n^2 + n}{2}$$\n\nComo na análise assintótica consideramos apenas o termo de maior grau e ignoramos constantes, temos que a complexidade de tempo no pior caso é $O(n^2)$.");
			r5.setQuestao(q6);
			r5.setAutor(especialista);
			r5.setUpvotes(3);
			r5.setVerificadoPorEspecialista(true);

			Resolucao r6 = new Resolucao();
			r6.setConteudo(
					"A função `fastPower` divide o problema pela metade a cada chamada recursiva.\n\nA relação de recorrência para o número de multiplicações $T(n)$ é dada por:\n$$T(n) = T(\\lfloor n/2 \\rfloor) + \\Theta(1)$$\n\nO número de passos é proporcional ao número de vezes que podemos dividir $n$ por 2, que é aproximadamente $\\log_2(n)$.\n\nPortanto, a complexidade de tempo é $O(\\log n)$.");
			r6.setQuestao(q7);
			r6.setAutor(admin);
			r6.setUpvotes(9);
			r6.setVerificadoPorEspecialista(true);

			resolucaoRepository.saveAll(Arrays.asList(r1, r2, rP, r3, r4, r5, r6));
			System.out.println("Resoluções de teste cadastradas!");

			System.out.println("=== Dados seed carregados com sucesso! ===");
		} else {
			System.out.println("Banco de dados já contém usuários. Pulando inicialização do seed.");
		}
	}
}
