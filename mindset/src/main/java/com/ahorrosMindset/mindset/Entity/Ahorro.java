package com.ahorrosMindset.mindset.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ahorros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ahorro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_ahorro_id", nullable = false)
    private PlanAhorro planAhorro;
}
