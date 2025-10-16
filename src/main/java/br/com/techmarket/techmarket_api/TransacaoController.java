package br.com.techmarket.techmarket_api;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    @PostMapping("/transferir")
    public ResponseEntity<String> realizarTransferencia(@Valid @RequestBody TransferenciaRequest request) {
        System.out.println("Recebida transferência de " + request.valor() + " da conta " + request.contaOrigemId());

        // Lógica de negócio simplificada para o teste
        String codigoUnico = UUID.randomUUID().toString();

        // Retornamos uma mensagem de sucesso com o código
        return ResponseEntity.ok("Transferência simulada com sucesso! Código: " + codigoUnico);
    }

    @GetMapping("/extrato")
    public ResponseEntity<List<Transacao>> buscarExtrato() {
        List<Transacao> transacoesMock = gerarDadosMock();
        return ResponseEntity.ok(transacoesMock);
    }

    // Método privado para gerar dados falsos para nosso teste
    private List<Transacao> gerarDadosMock() {
        return List.of(
            new Transacao("Salário Mensal", new BigDecimal("9500.00"), "entrada", LocalDate.now().withDayOfMonth(5)),
            new Transacao("Pagamento Fornecedor XYZ", new BigDecimal("7820.00"), "saida", LocalDate.now().withDayOfMonth(8)),
            new Transacao("Compra Online - TechStore", new BigDecimal("1250.50"), "saida", LocalDate.now().withDayOfMonth(10)),
            new Transacao("Supermercado Alfa", new BigDecimal("450.75"), "saida", LocalDate.now().withDayOfMonth(12)),
            new Transacao("Reembolso de Despesa", new BigDecimal("300.00"), "entrada", LocalDate.now().withDayOfMonth(15))
        );
    }
}