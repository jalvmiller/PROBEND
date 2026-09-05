package br.com.joaomu.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import br.com.joaomu.config.RabbitMQConfig;
import br.com.joaomu.dto.event.ResolucaoEmailEvent;

// Listener da Dead Letter Queue (DLQ),
// consome mensagens que falharam após todas as tentativas de retry na fila principal

// Em produção, esse ponto poderia integrar com alertas (Slack, PagerDuty)
// ou persistir a falha em uma tabela de auditoria para re-processamento manual

@Component
public class DeadLetterListener {

    private static final Logger log = LoggerFactory.getLogger(DeadLetterListener.class);

    @RabbitListener(queues = RabbitMQConfig.QUEUE_EMAIL_DLQ)
    public void processarMensagemFalha(ResolucaoEmailEvent event) {
        log.error("Mensagem na DLQ após falha definitiva: destinatário={}, email={}, questão={}, autor={}",
                event.nomeDestinatario(),
                event.emailDestinatario(),
                event.tituloQuestao(),
                event.autorResolucao());
    }
}
