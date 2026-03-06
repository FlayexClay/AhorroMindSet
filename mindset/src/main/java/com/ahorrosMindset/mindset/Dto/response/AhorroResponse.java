package com.ahorrosMindset.mindset.Dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class AhorroResponse {
    private Long id;
    private LocalDate fecha;
    private BigDecimal monto;
    private Long planAhorroId;
}
