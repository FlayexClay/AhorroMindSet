package com.ahorrosMindset.mindset.Entity;

import com.ahorrosMindset.mindset.common.CurrencyType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Month;
import java.util.List;

@Entity
@Table(name = "planes_ahorro")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanAhorro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal metaMensual;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_moneda",nullable = false)
    private CurrencyType tipoMoneda;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Month mes;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal montoRecibido = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @OneToMany(mappedBy = "planAhorro", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ahorro> ahorros;

    @Transient
    public BigDecimal getMetaRestante(){
        return metaMensual.subtract(montoRecibido).max(BigDecimal.ZERO);
    }

    @Transient
    public boolean isMetaAlcanzada(){
        return montoRecibido.compareTo(metaMensual) >= 0;
    }
}
