package br.com.joaomu.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

//import java.security.Key;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // minímo de 32 caracteres para equivaler a 256 bits
    private final String SECRET_KEY = "DivideEtImperaFortunaIuvat256bitsAAAOOOYEAAAA12845610";
    private final long EXPIRATION_TIME = 86400000; // 24 horas em ms

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(String username) {
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith( getSigningKey() )
            .compact();
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
