// --- Selecionando os Elementos do Formulário ---
const form = document.getElementById('form-cadastro');
const cpfInput = document.getElementById('cpf');
const dataInput = document.getElementById('dataNascimento');
const telefoneInput = document.getElementById('telefone');


// Adiciona um "ouvinte" para o evento de digitação no campo CPF
cpfInput.addEventListener('input', () => {
    // Pega o valor atual, remove tudo que não for número
    let cpfLimpo = cpfInput.value.replace(/\D/g, '');

    // Limita o tamanho para 11 dígitos
    cpfLimpo = cpfLimpo.substring(0, 11);

    // Aplica a máscara
    const cpfFormatado = formatarCPF(cpfLimpo);

    // Devolve o valor formatado para o campo
    cpfInput.value = cpfFormatado;
});

// Adiciona um "ouvinte" para o evento de digitação no campo Telefone
telefoneInput.addEventListener('input', () => {
    let telefoneLimpo = telefoneInput.value.replace(/\D/g, '');

    // Limita o tamanho para 11 dígitos (para celular com 9)
    telefoneLimpo = telefoneLimpo.substring(0, 11);

    const telefoneFormatado = formatarTelefone(telefoneLimpo);
    telefoneInput.value = telefoneFormatado;
});


// Função para formatar o CPF (ex: 123.456.789-00)
function formatarCPF(cpf) {
    if (cpf.length > 9) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
        return cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
        return cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    return cpf;
}

// Função para formatar o Telefone (ex: (11) 98765-4321)
function formatarTelefone(telefone) {
    if (telefone.length > 10) { // Celular com 9
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length > 6) { // Celular com 8 ou Fixo
        return telefone.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    } else if (telefone.length > 2) {
        return telefone.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    }
    return telefone;
}


form.addEventListener('submit', function (event) {
    event.preventDefault(); // Impede o envio do formulário para validarmos primeiro

    let erros = []; // Vamos acumular os erros aqui

    // Validação de CPF
    const cpfLimpo = cpfInput.value.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        erros.push('O CPF deve conter exatamente 11 dígitos.');
    }

    // Validação de Data de Nascimento
    if (dataInput.value === '' || new Date(dataInput.value) > new Date()) {
        erros.push('A Data de Nascimento é inválida ou está no futuro.');
    }

    // Validação de Telefone
    const telefoneLimpo = telefoneInput.value.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        erros.push('O Telefone é inválido. Deve conter 10 ou 11 dígitos.');
    }

    // Verificando se houve erros
    if (erros.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops... Erros de Validação',
            html: erros.join('<br>'),
            confirmButtonColor: '#0d6efd'
        });
    } else {
        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Cadastro validado! Você será redirecionado para o extrato.',
            timer: 2000, // Mostra o alerta por 2 segundos
            showConfirmButton: false // Esconde o botão "OK"
        }).then(() => {
            // Após o alerta desaparecer, redireciona o usuário
            window.location.href = 'extrato.html';
        });
    }
});

// Quando a página carregar, busca os dados do extrato
document.addEventListener('DOMContentLoaded', () => {
    buscarDadosDoExtrato();
});

async function buscarDadosDoExtrato() {
    try {
        // 1. CHAMA O ENDPOINT DO BACKEND
        // (Este endpoint /api/extrato/101 ainda não criamos, é apenas um exemplo)
        const response = await fetch('/api/extrato/101');
        const transacoes = await response.json(); // Converte a resposta para JSON

        // 2. ATUALIZA O HTML (FRONTEND) COM OS DADOS RECEBIDOS
        const lista = document.getElementById('lista-transacoes');
        lista.innerHTML = ''; // Limpa a lista antes de adicionar os novos itens

        transacoes.forEach(transacao => {
            const item = document.createElement('li');
            item.className = 'list-group-item';
            item.textContent = `${transacao.descricao} - R$ ${transacao.valor}`;
            lista.appendChild(item);
        });

    } catch (error) {
        console.error('Falha ao buscar dados do extrato:', error);
    }
}