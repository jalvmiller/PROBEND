package br.com.joaomu.service;

import org.springframework.stereotype.Service;

@Service
public class NotificacaoService {

    public void enviarEmailResolucao(String email, String assunto, String mensagem) {
        // TODO: Implementar lógica de envio de e-mail real (ex: usando JavaMailSender ou AWS SES)
        System.out.println("--------------------------------------------------");
        System.out.println("Disparando e-mail real para: " + email);
        System.out.println("Assunto: " + assunto);
        System.out.println("Corpo: \n" + mensagem);
        System.out.println("--------------------------------------------------");
    }
}
