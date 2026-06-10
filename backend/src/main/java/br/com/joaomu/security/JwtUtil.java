package br.com.joaomu.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

//import java.security.Key;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // minímo de 32 caracteres para equivaler a 256 bits
    @Value("${jwt.secret}") // Segurança para o spring
    private String SECRET_KEY;
    private final long EXPIRATION_TIME = 86400000; // 24 horas em ms

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes()); // CONVERSÃO HMAC-SHA, padrão do JWT.. geração de chave segura
    }

    public String generateToken(String username) {
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith( getSigningKey() ) // assinar o token com a chave
            .compact(); // token é gerado como string compacta, padrão da doc do JWT
    }


    public String extractUsername(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }

    
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);

            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
