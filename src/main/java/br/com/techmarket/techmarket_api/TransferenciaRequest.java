// Arquivo: src/main/java/br/com/techmarket/techmarketapi/TransferenciaRequest.java
package br.com.techmarket.techmarket_api;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record TransferenciaRequest(
    @NotNull Long contaOrigemId,
    @NotNull Long contaDestinoId,
    @Positive @NotNull BigDecimal valor
) {}