package br.com.joaomu.controller;

import br.com.joaomu.config.GlobalExceptionHandler;
import br.com.joaomu.dto.questao.QuestaoRequest;
import br.com.joaomu.entity.Questao;
import br.com.joaomu.service.QuestaoService;
import br.com.joaomu.service.UpvoteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * testes unitários para a camada Web (QuestaoRestController)
 * Utiliza MockMvc em modo Standalone:
 * - Não inicializa servidor web real nem banco de dados (execução em milissegundos).
 * - Testa rotas HTTP, verbos (GET, POST, DELETE), serialização JSON,
 *   regras de Bean Validation (@Valid) e tratamento global de erros (@RestControllerAdvice).
 */
@ExtendWith(MockitoExtension.class)
public class QuestaoRestControllerTest {

    private MockMvc mockMvc;

    @Mock
    private QuestaoService questaoService;

    @Mock
    private UpvoteService upvoteService;

    @InjectMocks
    private QuestaoRestController questaoRestController;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private Questao questaoPadrao;

    @BeforeEach
    void setUp() {
        // Configura o validador do Bean Validation (Hibernate/Jakarta) no MockMvc standalone
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(questaoRestController)
                // GlobalExceptionHandler do projeto; pode instanciar sem problemas já que
                // está com a anotação de @RestControllerAdvice em sua classe
                .setControllerAdvice(new GlobalExceptionHandler()) 
                .setValidator(validator)
                .build();

        // Questão simulada para os retornos do Service
        questaoPadrao = new Questao();
        questaoPadrao.setId(1L);
        questaoPadrao.setEnunciado("Qual é a capital do Brasil?");
        questaoPadrao.setMateria("Geografia");
        questaoPadrao.setDificuldade(0);
        questaoPadrao.setUpvotes(0);
    }

    // Nesse teste -> induz sucesso e verifica se o pedido de listar todos retornou listarTodos times(1)
    // Status HTTP 200 OK
    @Test
    void deveListarTodasAsQuestoesComSucesso() throws Exception {
        // Arrange
        when(questaoService.listarTodos()).thenReturn(List.of(questaoPadrao));

        // Act & Assert
        mockMvc.perform(get("/questoes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].enunciado").value("Qual é a capital do Brasil?"))
                .andExpect(jsonPath("$[0].materia").value("Geografia"));

        verify(questaoService, times(1)).listarTodos();
    }

    // Nesse teste -> induz sucesso e verifica se o pedido de buscar por id retornou buscarPorId times(1)
    // Status HTTP 200 OK
    @Test
    void deveBuscarQuestaoPorIdComSucesso() throws Exception {
        // Arrange
        when(questaoService.buscarPorId(1L)).thenReturn(questaoPadrao);

        // Act & Assert
        mockMvc.perform(get("/questoes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.enunciado").value("Qual é a capital do Brasil?"))
                .andExpect(jsonPath("$.materia").value("Geografia"));

        verify(questaoService, times(1)).buscarPorId(1L);
    }

    // Nesse teste -> induz sucesso e verifica se o pedido de salvar questão retornou salvar times(1)
    // Status HTTP 201 OK
    @Test
    void deveCriarQuestaoComSucessoQuandoDadosForemValidos() throws Exception {
        // Arrange
        QuestaoRequest requestValido = new QuestaoRequest(
                "Qual é a capital do Brasil?",
                null,
                "Geografia",
                "Capitais",
                0,
                null,
                null,
                null
        );

        when(questaoService.salvar(any(Questao.class))).thenReturn(questaoPadrao);

        // Act & Assert
        mockMvc.perform(post("/questoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestValido)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.enunciado").value("Qual é a capital do Brasil?"))
                .andExpect(jsonPath("$.materia").value("Geografia"));

        verify(questaoService, times(1)).salvar(any(Questao.class));
    }

    // Nesse teste -> induz erro e verifica se o pedido de salvar questão nunca retornou (never) salvar com
    // resposta de sucesso.. ou seja, o pedido foi barrado logo na validação com @Valid.. a requisição foi
    // barrada antes de chegar na camada Service
    // Status HTTP 400 Bad Request
    @Test
    void deveRetornar400QuandoCriarQuestaoComDadosInvalidos() throws Exception {
        // Arrange: DTO violando as anotações @NotBlank do Bean Validation
        QuestaoRequest requestInvalido = new QuestaoRequest(
                "", // Enunciado em branco (viola @NotBlank)
                null,
                "", // Matéria em branco (viola @NotBlank)
                null,
                0,
                null,
                null,
                null
        );

        // Act & Assert: o MockMvc deve interceptar via GlobalExceptionHandler e devolver status 400 Bad Request
        mockMvc.perform(post("/questoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Dados inválidos"))
                .andExpect(jsonPath("$.campos.enunciado").exists())
                .andExpect(jsonPath("$.campos.materia").exists());

        // O service nem deve ser chamado quando a validação falha
        verify(questaoService, never()).salvar(any(Questao.class));
    }

    // Nesse teste -> induz sucesso e verifica se o pedido de remover retornou remover times(1)
    // Status HTTP 204 NO CONTENT
    @Test
    void deveRemoverQuestaoComSucesso() throws Exception {
        // Arrange
        doNothing().when(questaoService).remover(1L);

        // Act & Assert
        mockMvc.perform(delete("/questoes/1"))
                .andExpect(status().isNoContent());

        // .andExpect(status().isNoContent()); é igual a sem corpo na resposta

        verify(questaoService, times(1)).remover(1L);
    }
}
