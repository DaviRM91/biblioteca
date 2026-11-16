package br.com.bibliotecabetim.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "exemplar")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Exemplar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;

    @Column(name = "codigo_tombamento", nullable = false, unique = true)
    private String codigoTombamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusExemplar status = StatusExemplar.DISPONIVEL;
}
