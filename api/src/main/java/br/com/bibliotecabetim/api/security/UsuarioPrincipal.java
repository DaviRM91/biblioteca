package br.com.bibliotecabetim.api.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UsuarioPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String senha;
    private final br.com.bibliotecabetim.api.model.Papel papel;
    private final Collection<? extends GrantedAuthority> authorities;

    public UsuarioPrincipal(Long id, String email, String senha, br.com.bibliotecabetim.api.model.Papel papel,
                            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.senha = senha;
        this.papel = papel;
        this.authorities = authorities;
    }

    public Long getId() {
        return id;
    }

    public br.com.bibliotecabetim.api.model.Papel getPapel() {
        return papel;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public static UsuarioPrincipal build(br.com.bibliotecabetim.api.model.Usuario usuario) {
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + usuario.getPapel().name()));
        return new UsuarioPrincipal(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getSenhaHash(),
                usuario.getPapel(),
                authorities);
    }
}
