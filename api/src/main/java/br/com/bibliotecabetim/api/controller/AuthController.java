package br.com.bibliotecabetim.api.controller;

import br.com.bibliotecabetim.api.dto.LoginRequest;
import br.com.bibliotecabetim.api.dto.RegistroRequest;
import br.com.bibliotecabetim.api.dto.TokenResponse;
import br.com.bibliotecabetim.api.security.JwtService;
import br.com.bibliotecabetim.api.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação", description = "Registro de morador e obtenção de token JWT")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UsuarioService usuarioService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    @Operation(summary = "Registro de morador", description = "Cadastra um novo morador na plataforma e retorna um token JWT.")
    @ApiResponse(responseCode = "200", description = "Morador registrado com sucesso, token retornado")
    @ApiResponse(responseCode = "400", description = "Email ou CPF já cadastrados")
    public ResponseEntity<TokenResponse> registro(@RequestBody RegistroRequest request) {
        var usuario = usuarioService.registrarMorador(
                request.nome(), request.email(), request.cpf(), request.telefone(), request.senha());
        String token = jwtService.gerarToken(usuario.email(), usuario.papel());
        return ResponseEntity.ok(new TokenResponse(token, "Bearer", usuario.papel().name()));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Autentica um usuário e retorna um token JWT.")
    @ApiResponse(responseCode = "200", description = "Login bem-sucedido, token retornado")
    @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha()));
        var usuario = usuarioService.buscarPorEmail(request.email());
        String token = jwtService.gerarToken(usuario.getEmail(), usuario.getPapel());
        return ResponseEntity.ok(new TokenResponse(token, "Bearer", usuario.getPapel().name()));
    }
}
