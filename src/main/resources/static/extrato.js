// Executa quando o conteúdo da página HTML for totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    buscarExtrato();
});

// Função assíncrona para buscar os dados no backend
async function buscarExtrato() {
    const listaUI = document.getElementById('lista-transacoes');

    try {
        // 1. Chama o nosso novo endpoint /api/transacoes/extrato
        const response = await fetch('/api/transacoes/extrato');
        if (!response.ok) {
            throw new Error('Falha ao buscar dados do extrato.');
        }
        const transacoes = await response.json(); // Converte a resposta para JSON

        // Limpa a mensagem "Carregando..."
        listaUI.innerHTML = '';

        // 2. Cria o HTML para cada transação recebida
        transacoes.forEach(transacao => {
            const item = document.createElement('li');
            // Define as classes do Bootstrap
            item.className = 'list-group-item d-flex justify-content-between align-items-center';

            // Verifica se a transação é alta (acima de R$ 5.000)
            if (transacao.valor > 5000) {
                item.classList.add('transacao-alta');
            }

            // Formata o valor para a moeda brasileira (R$)
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(transacao.valor);

            // Define a cor do valor (vermelho para saída, verde para entrada)
            const corValor = transacao.tipo === 'saida' ? 'text-danger' : 'text-success';
            const sinal = transacao.tipo === 'saida' ? '-' : '+';

            // Monta o HTML interno do item da lista
            item.innerHTML = `
                <span>
                    ${transacao.descricao}
                    <small class="d-block text-muted">${new Date(transacao.data).toLocaleDateString('pt-BR')}</small>
                </span>
                <span class="${corValor}">${sinal} ${valorFormatado}</span>
            `;

            // Adiciona o item na lista da tela
            listaUI.appendChild(item);
        });

    } catch (error) {
        listaUI.innerHTML = `<li class="list-group-item text-danger">${error.message}</li>`;
    }
}