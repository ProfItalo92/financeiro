let dadosFinanceiros = [];
let idAtual = 1;

// Carregar dados do localStorage
if (localStorage.getItem('financeiros')) {
  dadosFinanceiros = JSON.parse(localStorage.getItem('financeiros'));
  idAtual = dadosFinanceiros.length > 0 ? Math.max(...dadosFinanceiros.map(i => i.id)) + 1 : 1;
  atualizarTabela();
}

document.getElementById('finance-form').addEventListener('submit', function (e) {
  e.preventDefault();
  tocarSom('click-sound');

  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value).toFixed(2);
  const tipo = document.getElementById('tipo').value;
  const data = document.getElementById('data').value;

  if (descricao && valor && data) {
    const entrada = {
      id: idAtual++,
      descricao,
      valor: parseFloat(valor),
      tipo,
      data
    };

    dadosFinanceiros.push(entrada);
    atualizarTabela();
    tocarSom('success-sound');
    this.reset();
  }
});

function atualizarTabela() {
  const tbody = document.querySelector('#tabela-balancete tbody');
  const totalDebito = document.getElementById('total-debito');
  const totalCredito = document.getElementById('total-credito');
  tbody.innerHTML = '';

  let debito = 0;
  let credito = 0;

  dadosFinanceiros.forEach((item) => {
    const tr = document.createElement('tr');
    const valorDebito = item.tipo === 'despesa' ? item.valor.toFixed(2) : '';
    const valorCredito = item.tipo === 'receita' ? item.valor.toFixed(2) : '';

    if (item.tipo === 'despesa') debito += item.valor;
    else if (item.tipo === 'receita') credito += item.valor;

    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.descricao}</td>
      <td>${valorDebito ? 'R$ ' + valorDebito : ''}</td>
      <td>${valorCredito ? 'R$ ' + valorCredito : ''}</td>
      <td>${item.data}</td>
      <td>
        <button class="editar" onclick="editarRegistro(${item.id})">Editar</button>
        <button class="remover" onclick="removerRegistro(${item.id})">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  totalDebito.textContent = `R$ ${debito.toFixed(2)}`;
  totalCredito.textContent = `R$ ${credito.toFixed(2)}`;

  // Salvar no localStorage
  localStorage.setItem('financeiros', JSON.stringify(dadosFinanceiros));
}

function editarRegistro(id) {
  const item = dadosFinanceiros.find((i) => i.id === id);
  if (item) {
    document.getElementById('descricao').value = item.descricao;
    document.getElementById('valor').value = item.valor;
    document.getElementById('tipo').value = item.tipo;
    document.getElementById('data').value = item.data;

    dadosFinanceiros = dadosFinanceiros.filter((i) => i.id !== id);
    atualizarTabela();
  }
}

function removerRegistro(id) {
  dadosFinanceiros = dadosFinanceiros.filter((i) => i.id !== id);
  atualizarTabela();
}

function exportarPlanilha() {
  let csv = 'ID,Descrição,Débito (R$),Crédito (R$),Data\n';
  let totalDebito = 0;
  let totalCredito = 0;

  dadosFinanceiros.forEach(item => {
    const debito = item.tipo === 'despesa' ? item.valor.toFixed(2) : '';
    const credito = item.tipo === 'receita' ? item.valor.toFixed(2) : '';
    if (item.tipo === 'despesa') totalDebito += item.valor;
    else if (item.tipo === 'receita') totalCredito += item.valor;

    csv += `${item.id},"${item.descricao}",${debito},${credito},${item.data}\n`;
  });

  csv += `,,R$ ${totalDebito.toFixed(2)},R$ ${totalCredito.toFixed(2)},\n`;

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'balancete-contabil.csv';
  link.click();
}

function imprimirPlanilha() {
  const win = window.open('', '', 'width=900,height=700');
  let debito = 0;
  let credito = 0;

  let html = `
    <html><head><title>Balancete Contábil</title>
      <style>
        body { font-family: Arial; padding: 30px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
        th { background-color: #1565c0; color: white; }
        tfoot td { font-weight: bold; background-color: #e8f5e9; }
      </style>
    </head><body>
      <h2>Balancete Contábil<br>Mês de Vigência: ${new Date().toLocaleDateString('pt-BR')}</h2>
      <table><thead>
        <tr><th>ID</th><th>Descrição</th><th>Débito (R$)</th><th>Crédito (R$)</th><th>Data</th></tr>
      </thead><tbody>`;

  dadosFinanceiros.forEach(item => {
    const debitoVal = item.tipo === 'despesa' ? item.valor.toFixed(2) : '';
    const creditoVal = item.tipo === 'receita' ? item.valor.toFixed(2) : '';
    if (item.tipo === 'despesa') debito += item.valor;
    else if (item.tipo === 'receita') credito += item.valor;

    html += `<tr>
      <td>${item.id}</td>
      <td>${item.descricao}</td>
      <td>${debitoVal ? 'R$ ' + debitoVal : ''}</td>
      <td>${creditoVal ? 'R$ ' + creditoVal : ''}</td>
      <td>${item.data}</td>
    </tr>`;
  });

  html += `
    </tbody><tfoot>
      <tr><td colspan="2">Totais</td>
      <td>R$ ${debito.toFixed(2)}</td>
      <td>R$ ${credito.toFixed(2)}</td>
      <td></td></tr>
    </tfoot></table></body></html>`;

  win.document.write(html);
  win.document.close();
  win.print();
}

function tocarSom(id) {
  const som = document.getElementById(id);
  if (som) som.play();
}
