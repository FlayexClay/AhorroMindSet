package com.ahorrosMindset.mindset.Dto.response;

import com.ahorrosMindset.mindset.common.CurrencyType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Month;

@Data
@Builder
public class PlanAhorroResponse {
    private Long id;
    private BigDecimal metaMensual;
    private CurrencyType tipoMoneda;
    private Month mes;
    private BigDecimal montoRecibido;
    private BigDecimal metaRestante;
    private boolean metaAlcanzada;
    private Long usuarioId;

}
