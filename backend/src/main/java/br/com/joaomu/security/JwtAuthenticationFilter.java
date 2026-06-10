package br.com.joaomu.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// validação dos tokens JWT para cada requisição HTTP.. se válido = autenticado, rotas protegidas sem precisar de login
// Sem ele, o spring security não validaria tokens em cada requisição

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {


    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    // conexão do filtro ao validador de tokens e ao carregador de usuários, sem a conexão.. o filtro não consegue extrair o username
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil; // utilitária, gerar validar extrair
        this.userDetailsService = userDetailsService;
    }

    // método principal chamado a cada requisição
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        // pega o header onde token vem, padrão

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        // se não houver token, passar a requisição adiante sem autenticar

        String token = authHeader.substring(7);
        // o header vem como "Authorization: Bearer <token>", temos a retirada do token puro, o resto é removido

        String username = jwtUtil.extractUsername(token);
        // usa o jwtutil para extrair o username

        // se tiver username e ninguém ainda autenticado.. prossegue
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(token)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken); // usuário colocado no contexto, logado para requisição
            }
        }

        filterChain.doFilter(request, response);
    }
}