document.addEventListener('DOMContentLoaded', () => {
    definirDataAtual();
    atualizarTabela(financas);
    gerarGrafico(financas);
});

document.getElementById('form-financas').addEventListener('submit', adicionarItem);

let financas = JSON.parse(localStorage.getItem('financas')) || [];

function definirDataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    document.getElementById('data').value = `${ano}-${mes}-${dia}`;
}

function adicionarItem(e) {
    e.preventDefault();

    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value.trim();
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;

    if (!descricao || isNaN(valor)) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    financas.push({ data, descricao, valor, tipo });
    localStorage.setItem('financas', JSON.stringify(financas));

    atualizarTabela(financas);
    gerarGrafico(financas);
    document.getElementById('form-financas').reset();
    definirDataAtual();
}

function atualizarTabela(dados) {
    const tbody = document.querySelector('#tabela-financas tbody');
    tbody.innerHTML = '';
    let total = 0;

    dados.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.data.split('-').reverse().join('/')}</td>
                <td>${item.descricao}</td>
                <td>${item.tipo === 'receita' ? 'Receita' : 'Despesa'}</td>
                <td>${item.valor.toFixed(2)}</td>
                <td><button onclick="removerItem(${index})">Excluir</button></td>
            </tr>
        `;

        total += item.tipo === 'receita' ? item.valor : -item.valor;
    });

    document.getElementById('balanco-total').textContent = `R$ ${total.toFixed(2)}`;
}

function removerItem(index) {
    financas.splice(index, 1);
    localStorage.setItem('financas', JSON.stringify(financas));
    atualizarTabela(financas);
    gerarGrafico(financas);
}

function filtrarMes() {
    const filtro = document.getElementById('filtro-mes').value;
    if (!filtro) return;

    const dadosFiltrados = financas.filter(i => i.data.startsWith(filtro));
    atualizarTabela(dadosFiltrados);
    gerarGrafico(dadosFiltrados);
}

function limparFiltro() {
    document.getElementById('filtro-mes').value = '';
    atualizarTabela(financas);
    gerarGrafico(financas);
}

let grafico;

function gerarGrafico(dados) {
    const ctx = document.getElementById('grafico-financas').getContext('2d');
    if (grafico) grafico.destroy();

    // Agrupar valores por mês/ano
    const valoresPorMes = {};
    
    dados.forEach(({ data, valor, tipo }) => {
        const [ano, mes] = data.split('-');
        const chave = `${mes}/${ano}`;
        
        if (!valoresPorMes[chave]) {
            valoresPorMes[chave] = { receita: 0, despesa: 0 };
        }

        if (tipo === 'receita') {
            valoresPorMes[chave].receita += valor;
        } else {
            valoresPorMes[chave].despesa += valor;
        }
    });

    // Separar os dados para o gráfico
    const labels = Object.keys(valoresPorMes).sort((a, b) => {
        const [mesA, anoA] = a.split('/');
        const [mesB, anoB] = b.split('/');
        return new Date(`${anoA}-${mesA}-01`) - new Date(`${anoB}-${mesB}-01`);
    });

    const receitas = labels.map(label => valoresPorMes[label].receita);
    const despesas = labels.map(label => valoresPorMes[label].despesa);

    // Criar gráfico de linha
    grafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitas,
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Despesas',
                    data: despesas,
                    borderColor: '#e53e3e',
                    backgroundColor: 'rgba(229, 62, 62, 0.2)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Receitas e Despesas por Mês/Ano' }
            },
            scales: {
                x: { title: { display: true, text: 'Mês/Ano' } },
                y: { title: { display: true, text: 'Valor (R$)' } }
            }
        }
    });
}

function removerItem(index) {
    financas.splice(index, 1);
    localStorage.setItem('financas', JSON.stringify(financas));
    atualizarTabela();
}