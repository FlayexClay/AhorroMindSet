package com.ahorrosMindset.mindset.Dto.request;

import com.ahorrosMindset.mindset.common.CurrencyType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Month;

@Data
public class PlanAhorroRequest {
    @NotNull(message = "La meta mensual es requerida")
    @DecimalMin(value = "0.01", message = "La meta mensual debe ser mayor a 0")
    private BigDecimal metaMensual;

    @NotNull(message = "El tipo de moneda es requerido")
    private CurrencyType tipoMoneda;

    @NotNull(message = "El mes es requerido")
    private Month mes;
}
