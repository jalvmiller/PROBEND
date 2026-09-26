package br.com.joaomu.service;

import br.com.joaomu.dto.comentario.ComentarioRequest;
import br.com.joaomu.dto.comentario.ComentarioResponse;
import br.com.joaomu.entity.Comentario;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.repository.ComentarioRepository;
import br.com.joaomu.repository.ResolucaoRepository;
import br.com.joaomu.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ComentarioServiceTest {

    @Mock
    private ComentarioRepository comentarioRepository;

    @Mock
    private ResolucaoRepository resolucaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ComentarioService comentarioService;

    private Usuario autor;
    private Resolucao resolucao;

    @BeforeEach
    void setUp() {
        autor = new Usuario();
        autor.setId(10L);
        autor.setUsername("autor_teste");

        resolucao = new Resolucao();
        resolucao.setId(1L);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockUsuarioAutenticado(String username) {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(username);
        when(auth.getName()).thenReturn(username);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void deveListarComentariosMontandoArvoreHierarquicaCorretamente() {
        // Arrange: 2 nós raiz, 1 resposta para a raiz 1, e 1 sub-resposta para a resposta
        Comentario raiz1 = new Comentario("Raiz 1", resolucao, autor);
        raiz1.setId(1L);
        raiz1.setDataCriacao(LocalDateTime.now().minusMinutes(10));

        Comentario raiz2 = new Comentario("Raiz 2", resolucao, autor);
        raiz2.setId(2L);
        raiz2.setDataCriacao(LocalDateTime.now().minusMinutes(8));

        Comentario filho1 = new Comentario("Filho da Raiz 1", resolucao, autor, raiz1);
        filho1.setId(3L);
        filho1.setDataCriacao(LocalDateTime.now().minusMinutes(5));

        Comentario neto1 = new Comentario("Neto da Raiz 1 (Filho do Filho 1)", resolucao, autor, filho1);
        neto1.setId(4L);
        neto1.setDataCriacao(LocalDateTime.now().minusMinutes(2));

        when(comentarioRepository.findByResolucao_IdOrderByDataCriacaoAsc(1L))
                .thenReturn(List.of(raiz1, raiz2, filho1, neto1));

        // Act
        List<ComentarioResponse> arvore = comentarioService.listarArvorePorResolucao(1L);

        // Assert: Apenas os nós raiz devem estar no nível superior
        assertEquals(2, arvore.size());

        // Raiz 1
        ComentarioResponse raiz1Dto = arvore.get(0);
        assertEquals(1L, raiz1Dto.id());
        assertNull(raiz1Dto.paiId());
        assertEquals(1, raiz1Dto.respostas().size());

        // Filho 1
        ComentarioResponse filho1Dto = raiz1Dto.respostas().get(0);
        assertEquals(3L, filho1Dto.id());
        assertEquals(1L, filho1Dto.paiId());
        assertEquals(1, filho1Dto.respostas().size());

        // Neto 1
        ComentarioResponse neto1Dto = filho1Dto.respostas().get(0);
        assertEquals(4L, neto1Dto.id());
        assertEquals(3L, neto1Dto.paiId());
        assertTrue(neto1Dto.respostas().isEmpty());

        // Raiz 2
        ComentarioResponse raiz2Dto = arvore.get(1);
        assertEquals(2L, raiz2Dto.id());
        assertTrue(raiz2Dto.respostas().isEmpty());
    }

    @Test
    void deveSalvarComentarioRaizComSucesso() {
        mockUsuarioAutenticado("autor_teste");

        when(resolucaoRepository.findById(1L)).thenReturn(Optional.of(resolucao));
        when(usuarioRepository.findByUsername("autor_teste")).thenReturn(Optional.of(autor));
        when(comentarioRepository.save(any(Comentario.class))).thenAnswer(i -> {
            Comentario c = i.getArgument(0);
            c.setId(100L);
            return c;
        });

        ComentarioRequest dto = new ComentarioRequest("Comentário de primeiro nível", null);

        // Act
        Comentario salvo = comentarioService.salvarComentario(1L, dto);

        // Assert
        assertNotNull(salvo);
        assertEquals(100L, salvo.getId());
        assertEquals("Comentário de primeiro nível", salvo.getConteudo());
        assertNull(salvo.getPai());
        assertEquals(resolucao, salvo.getResolucao());
        assertEquals(autor, salvo.getAutor());
        verify(comentarioRepository, never()).findByIdAndResolucao_Id(anyLong(), anyLong());
    }

    @Test
    void deveSalvarComentarioFilhoComSucesso() {
        mockUsuarioAutenticado("autor_teste");

        Comentario pai = new Comentario("Comentário pai", resolucao, autor);
        pai.setId(50L);

        when(resolucaoRepository.findById(1L)).thenReturn(Optional.of(resolucao));
        when(usuarioRepository.findByUsername("autor_teste")).thenReturn(Optional.of(autor));
        when(comentarioRepository.findByIdAndResolucao_Id(50L, 1L)).thenReturn(Optional.of(pai));
        when(comentarioRepository.save(any(Comentario.class))).thenAnswer(i -> {
            Comentario c = i.getArgument(0);
            c.setId(101L);
            return c;
        });

        ComentarioRequest dto = new ComentarioRequest("Resposta aninhada", 50L);

        // Act
        Comentario salvo = comentarioService.salvarComentario(1L, dto);

        // Assert
        assertNotNull(salvo);
        assertEquals(101L, salvo.getId());
        assertEquals("Resposta aninhada", salvo.getConteudo());
        assertNotNull(salvo.getPai());
        assertEquals(50L, salvo.getPai().getId());
        verify(comentarioRepository, times(1)).findByIdAndResolucao_Id(50L, 1L);
    }

    @Test
    void deveLancarExcecaoQuandoPaiNaoPertencerAMesmaResolucaoOuNaoExistir() {
        mockUsuarioAutenticado("autor_teste");

        when(resolucaoRepository.findById(1L)).thenReturn(Optional.of(resolucao));
        when(usuarioRepository.findByUsername("autor_teste")).thenReturn(Optional.of(autor));
        when(comentarioRepository.findByIdAndResolucao_Id(999L, 1L)).thenReturn(Optional.empty());

        ComentarioRequest dto = new ComentarioRequest("Tentativa de injeção cruzada", 999L);

        // Act & Assert
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                comentarioService.salvarComentario(1L, dto)
        );

        assertTrue(ex.getMessage().contains("Comentário pai não encontrado nesta resolução"));
        verify(comentarioRepository, never()).save(any(Comentario.class));
    }

    @Test
    void deveLancarExcecaoQuandoConteudoVazio() {
        ComentarioRequest dto = new ComentarioRequest("   ", null);

        assertThrows(IllegalArgumentException.class, () ->
                comentarioService.salvarComentario(1L, dto)
        );
    }
}
