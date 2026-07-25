package br.com.joaomu.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import br.com.joaomu.config.RabbitMQConfig;
import br.com.joaomu.dto.ResolucaoEmailEvent;
import br.com.joaomu.service.NotificacaoService;

@Component
public class ResolucaoEmailListener {

    private final NotificacaoService notificacaoService;

    public ResolucaoEmailListener(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }
    // Serviço que cuida de email
    // AWS SES; Spring Mail

    @RabbitListener(queues = RabbitMQConfig.QUEUE_EMAIL)
    public void ouvirResolucaoEmail(ResolucaoEmailEvent event) {
        System.out.println("====== NOVA MENSAGEM RECEBIDA ======");
        System.out.println("Notificar usuário: " + event.nomeDestinatario() + " (" + event.emailDestinatario() + ")");
        System.out.println("Questão: " + event.tituloQuestao() + " | Respondida por: " + event.autorResolucao());

        String assunto = "Nova resolução disponível - " + event.tituloQuestao();
        String mensagem = String.format(
            "Olá %s!\n\nA sua questão sobre %s recebeu uma nova resolução criada por %s.\n\nAtenciosamente,\nEquipe Probend",
            event.nomeDestinatario(),
            event.tituloQuestao(),
            event.autorResolucao()
        );

        try {
            // Integrar lógica de envio de email
            notificacaoService.enviarEmailResolucao(
                event.emailDestinatario(),
                assunto,
                mensagem
            );
            
            System.out.println("Email enviado com sucesso!");
        } catch (Exception e) {
            System.out.println("Erro ao enviar email: " + e.getMessage());
            // Lançar a exceção faz com que a mensagem vá para o Retry
            throw e;
        }
    }
}