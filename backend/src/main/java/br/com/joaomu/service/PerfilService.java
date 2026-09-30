package br.com.joaomu.service;

import br.com.joaomu.dto.perfil.MeuComentarioResponse;
import br.com.joaomu.dto.perfil.MinhaResolucaoResponse;
import br.com.joaomu.dto.questao.QuestaoResponse;
import br.com.joaomu.repository.ComentarioRepository;
import br.com.joaomu.repository.QuestaoRepository;
import br.com.joaomu.repository.ResolucaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço de Fachada / Aplicação para o Módulo de Perfil e Sidebar.
 * Orquestra as consultas de leitura agregadas das contribuições do usuário logado,
 * garantindo encapsulamento transacional e entregando DTOs prontos para o Controller.
 */
@Service
@Transactional(readOnly = true)
public class PerfilService {

    private final QuestaoRepository questaoRepository;
    private final ResolucaoRepository resolucaoRepository;
    private final ComentarioRepository comentarioRepository;

    public PerfilService(
            QuestaoRepository questaoRepository,
            ResolucaoRepository resolucaoRepository,
            ComentarioRepository comentarioRepository) {
        this.questaoRepository = questaoRepository;
        this.resolucaoRepository = resolucaoRepository;
        this.comentarioRepository = comentarioRepository;
    }

    /**
     * Retorna todas as questões criadas pelo usuário autenticado.
     */
    public List<QuestaoResponse> listarMinhasQuestoes(Long usuarioId) {
        if (usuarioId == null) {
            return List.of();
        }
        return questaoRepository.findByAutor_IdOrderByDataInsercaoDesc(usuarioId)
                .stream()
                .map(QuestaoResponse::fromEntity)
                .toList();
    }

    /**
     * Retorna todas as resoluções postadas pelo usuário autenticado.
     */
    public List<MinhaResolucaoResponse> listarMinhasResolucoes(Long usuarioId) {
        if (usuarioId == null) {
            return List.of();
        }
        return resolucaoRepository.findByAutor_IdOrderByDataCriacaoDesc(usuarioId)
                .stream()
                .map(MinhaResolucaoResponse::fromEntity)
                .toList();
    }

    /**
     * Retorna todos os comentários realizados pelo usuário autenticado.
     */
    public List<MeuComentarioResponse> listarMeusComentarios(Long usuarioId) {
        if (usuarioId == null) {
            return List.of();
        }
        return comentarioRepository.findByAutor_IdOrderByDataCriacaoDesc(usuarioId)
                .stream()
                .map(MeuComentarioResponse::fromEntity)
                .toList();
    }
}
