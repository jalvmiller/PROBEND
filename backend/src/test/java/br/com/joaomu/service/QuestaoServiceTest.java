package br.com.joaomu.service;

import br.com.joaomu.model.Questao;
import br.com.joaomu.repo.QuestaoRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

// Para rodar: mvn test -Dtest=QuestaoServiceTest
// Anotação JUnit
@ExtendWith(MockitoExtension.class)
public class QuestaoServiceTest {

    @Mock // Criando um obj falso de QuestaoRepository
    private QuestaoRepository questaoRepository;

    @InjectMocks // Injetando o mock como dependência
    private QuestaoService questaoService;

    // Variávle usada para os testes, vai ser populada no BeforeEach
    private Questao questao;

    @BeforeEach
    void setUp() {
        // Configura uma questão padrão para os testes
        questao = new Questao();
        questao.setId(1L);
        questao.setEnunciado("Qual é a capital do Brasil?");
        questao.setMateria("Geografia");
        questao.setDificuldade(0);
    }

    // Padrão AAA
    // Uso do when + save -> casos onde existe a necessidade de chamar uma dependência externa
    // Repositório, API, serviço
    // Nessa debaixo ele chega a usar.. justamente por conta do uso do repositório para salvar
    // Na seguinte, não há o uso..  é só uma validação que vai dar trigger na exceção

    // Nesse teste -> induz validação
    @Test
    void deveValidarQuestaoComSucesso() {
        // Arrange - configura o mock para retornar a questão quando save for chamado
        when(questaoRepository.save(any(Questao.class))).thenReturn(questao);

        // Act - executa o método que será testado
        Questao resultado = questaoService.validarQuestao(questao);

        // Assert - verifica se o resultado está correto
        // assertNotNull só precisa do retorno, e já consegue conferir
        // aseertEquals usa a String que foi enviada no set, e o getenunciado do resultado
        assertNotNull(resultado);
        assertEquals("Qual é a capital do Brasil?", resultado.getEnunciado());
        assertEquals("Geografia", resultado.getMateria());
    }

    // Nesse teste -> induz exceção
    @Test
    void deveLancarExcecaoQuandoEnunciadoVazio() {
        // Arrange
        questao.setEnunciado("");

        // Act & Assert - verifica se lança a exceção correta
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> questaoService.validarQuestao(questao)
        );

        assertEquals("Uso de enunciado é obrigatório", exception.getMessage());
    }

    // Nesse teste -> induz exceção
    @Test
    void deveLancarExcecaoQuandoEnunciadoNulo() {
        // Arrange
        questao.setEnunciado(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> questaoService.validarQuestao(questao)
        );

        assertEquals("Uso de enunciado é obrigatório", exception.getMessage());
    }

    // Nesse teste -> induz exceção + Considera valor VAZIO
    @Test
    void deveLancarExcecaoQuandoMateriaVazia() {
        // Arrange
        questao.setMateria("");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> questaoService.validarQuestao(questao)
        );

        assertEquals("Matéria é obrigatória!", exception.getMessage());
    }

    // Nesse teste -> induz exceção + Considera valor NULO
    @Test
    void deveLancarExcecaoQuandoMateriaNula() {
        // Arrange
        questao.setMateria(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> questaoService.validarQuestao(questao)
        );

        assertEquals("Matéria é obrigatória!", exception.getMessage());
    }

    @Test
    void deveLancarExcecaoQuandoQuestaoAltoNivelSemFonte() {
        // Arrange
        questao.setDificuldade(2); // Dificuldade alta
        questao.setFonte(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> questaoService.validarQuestao(questao)
        );

        assertEquals("Questões de dificuldade alta precisam ter fonte!", exception.getMessage());
    }

    // Teste como o de validar ou salvar, mas ele considera o envio de dificuldade 2
    // e a fonte sendo válida no contexto do service
    @Test
    void devePermitirQuestaoAltoNivelComFonte() {
        // Arrange
        questao.setDificuldade(2);
        questao.setFonte("https://exemplo.com");
        when(questaoRepository.save(any(Questao.class))).thenReturn(questao);

        // Act
        Questao resultado = questaoService.validarQuestao(questao);

        // Assert
        assertNotNull(resultado);
        assertEquals("https://exemplo.com", resultado.getFonte());
    }

    @Test
    void deveAjustarDificuldadeInvalida() {
        // Arrange
        questao.setDificuldade(-1);

        // Act
        questaoService.validarDificuldade(questao);

        // Assert
        assertEquals(0, questao.getDificuldade());
    }

    @Test
    void deveAjustarDificuldadeAcimaDoMaximo() {
        // Arrange
        questao.setDificuldade(3);

        // Act
        questaoService.validarDificuldade(questao);

        // Assert
        assertEquals(0, questao.getDificuldade());
    }

    @Test
    void naoDeveMudarDificuldadeValida() {
        // Arrange
        questao.setDificuldade(1);

        // Act
        questaoService.validarDificuldade(questao);

        // Assert
        assertEquals(1, questao.getDificuldade());
    }
}
