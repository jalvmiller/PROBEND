package br.com.joaomu.controller;

import br.com.joaomu.config.GlobalExceptionHandler;
import br.com.joaomu.dto.auth.AutorResumoResponse;
import br.com.joaomu.dto.comentario.ComentarioRequest;
import br.com.joaomu.dto.comentario.ComentarioResponse;
import br.com.joaomu.entity.Comentario;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.service.ComentarioService;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes unitários para a camada Web (ComentarioRestController).
 * Utiliza MockMvc em modo Standalone (execução rápida em milissegundos, sem subir Tomcat ou banco).
 */
@ExtendWith(MockitoExtension.class)
public class ComentarioRestControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ComentarioService comentarioService;

    @InjectMocks
    private ComentarioRestController comentarioRestController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(comentarioRestController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void deveListarComentariosEmArvoreComSucesso() throws Exception {
        AutorResumoResponse autor = new AutorResumoResponse("joao", "avatar.png", false, false);
        ComentarioResponse filho = new ComentarioResponse(2L, 1L, "Resposta", LocalDateTime.now(), autor, new ArrayList<>());
        ComentarioResponse raiz = new ComentarioResponse(1L, null, "Comentário Raiz", LocalDateTime.now(), autor, List.of(filho));

        when(comentarioService.listarArvorePorResolucao(1L)).thenReturn(List.of(raiz));

        mockMvc.perform(get("/questoes/resolucoes/1/comentarios")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].paiId").doesNotExist())
                .andExpect(jsonPath("$[0].conteudo").value("Comentário Raiz"))
                .andExpect(jsonPath("$[0].respostas", hasSize(1)))
                .andExpect(jsonPath("$[0].respostas[0].id").value(2))
                .andExpect(jsonPath("$[0].respostas[0].paiId").value(1))
                .andExpect(jsonPath("$[0].respostas[0].conteudo").value("Resposta"));

        verify(comentarioService, times(1)).listarArvorePorResolucao(1L);
    }

    @Test
    void deveCriarComentarioComSucesso() throws Exception {
        ComentarioRequest request = new ComentarioRequest("Ótima resolução!", 1L);

        Usuario autor = new Usuario();
        autor.setUsername("autor_teste");

        Resolucao resolucao = new Resolucao();
        resolucao.setId(1L);

        Comentario comentarioSalvo = new Comentario("Ótima resolução!", resolucao, autor);
        comentarioSalvo.setId(10L);

        when(comentarioService.salvarComentario(eq(1L), any(ComentarioRequest.class)))
                .thenReturn(comentarioSalvo);

        mockMvc.perform(post("/questoes/resolucoes/1/comentarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.conteudo").value("Ótima resolução!"));

        verify(comentarioService, times(1)).salvarComentario(eq(1L), any(ComentarioRequest.class));
    }

    @Test
    void deveRejeitarComentarioComConteudoVazioRetornandoBadRequest() throws Exception {
        ComentarioRequest request = new ComentarioRequest("   ", null);

        mockMvc.perform(post("/questoes/resolucoes/1/comentarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Dados inválidos"))
                .andExpect(jsonPath("$.campos.conteudo").exists());

        verify(comentarioService, never()).salvarComentario(anyLong(), any(ComentarioRequest.class));
    }

    @Test
    void deveRetornarNotFoundQuandoResolucaoNaoExistir() throws Exception {
        ComentarioRequest request = new ComentarioRequest("Comentário", null);

        when(comentarioService.salvarComentario(eq(999L), any(ComentarioRequest.class)))
                .thenThrow(new IllegalArgumentException("Resolução não encontrada: 999"));

        mockMvc.perform(post("/questoes/resolucoes/999/comentarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Resolução não encontrada: 999"));
    }

    @Test
    void deveRetornarBadRequestQuandoPaiNaoPertencerAResolucao() throws Exception {
        ComentarioRequest request = new ComentarioRequest("Resposta invasora", 50L);

        when(comentarioService.salvarComentario(eq(1L), any(ComentarioRequest.class)))
                .thenThrow(new IllegalArgumentException("Comentário pai não encontrado nesta resolução: 50"));

        mockMvc.perform(post("/questoes/resolucoes/1/comentarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Comentário pai não encontrado nesta resolução: 50"));
    }
}
