package br.com.techmarket.techmarket_api;

import java.math.BigDecimal;
import java.time.LocalDate;

// Usamos um 'record' para criar uma classe de dados imutável de forma concisa.
public record Transacao(
    String descricao,
    BigDecimal valor,
    String tipo, // "entrada" ou "saida"
    LocalDate data
) {}