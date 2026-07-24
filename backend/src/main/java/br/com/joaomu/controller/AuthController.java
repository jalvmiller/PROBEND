package br.com.joaomu.controller;

import br.com.joaomu.dto.AuthResponse;
import br.com.joaomu.dto.LoginRequest;
import br.com.joaomu.dto.RegisterRequest;
import br.com.joaomu.entity.User;
import br.com.joaomu.repository.UserRepository;
import br.com.joaomu.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
            PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setNome(request.nome());
        user.setEmail(request.email());

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(new AuthResponse(token));
        // No cadastro, o usuário é criado e já recebe um token de autenticação
        // o token é devolvido pelo corpo da resposta AuthResponse
        // Retorna HTTP 201 Created caso o cadastro seja realizado normalmente
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        String token = jwtUtil.generateToken(request.username());

        return ResponseEntity.ok(new AuthResponse(token));
        // No login, o usuário é autenticado e recebe um token de autenticação
        // o token é devolvido pelo corpo da resposta AuthResponse
        // Retorna HTTP 200 OK caso o login seja realizado normalmente
    }

    // Retorna os dados do usuário logado
    @GetMapping("/me")
    public ResponseEntity<User> me() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        return ResponseEntity.ok(user);
        // Retorna HTTP 200 OK caso o usuário seja encontrado
    }
}