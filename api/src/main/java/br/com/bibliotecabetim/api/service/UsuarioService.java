package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.dto.UsuarioResponse;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + id));
        return toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse registrarMorador(String nome, String email, String cpf, String telefone, String senha) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Já existe um usuário com este e-mail: " + email);
        }
        if (cpf != null && !cpf.isBlank() && usuarioRepository.existsByCpf(cpf)) {
            throw new IllegalArgumentException("Já existe um usuário com este CPF: " + cpf);
        }
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setCpf(cpf);
        usuario.setTelefone(telefone);
        usuario.setSenhaHash(passwordEncoder.encode(senha));
        usuario.setPapel(br.com.bibliotecabetim.api.model.Papel.MORADOR);
        usuario.setAtivo(true);
        usuario = usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado com este e-mail: " + email));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCpf(),
                usuario.getTelefone(),
                usuario.getPapel(),
                usuario.getAtivo(),
                usuario.getCriadoEm()
        );
    }
}
