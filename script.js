let dadosFinanceiros = [];
let idAtual = 1;
let filtroMes = '';
let filtroAno = '';

// Carregar dados do localStorage
if (localStorage.getItem('financeiros')) {
  dadosFinanceiros = JSON.parse(localStorage.getItem('financeiros'));
  idAtual = dadosFinanceiros.length > 0
    ? Math.max(...dadosFinanceiros.map(i => i.id)) + 1
    : 1;
}

document.getElementById('finance-form').addEventListener('submit', function (e) {
  e.preventDefault();
  tocarSom('click-sound');

  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value).toFixed(2);
  const tipo = document.getElementById('tipo').value;
  const data = document.getElementById('data').value;

  if (descricao && valor > 0 && data) {
    const entrada = {
      id: idAtual++,
      descricao,
      valor: parseFloat(valor),
      tipo,
      data
    };

    dadosFinanceiros.push(entrada);
    localStorage.setItem('financeiros', JSON.stringify(dadosFinanceiros));
    this.reset();
    preencherFiltroAno();
    atualizarTabela();
    tocarSom('success-sound');
  }
});

function atualizarTabela() {
  const tbody = document.querySelector('#tabela-balancete tbody');
  const totalDebito = document.getElementById('total-debito');
  const totalCredito = document.getElementById('total-credito');
  const valorInvestimento = document.getElementById('valor-investimento');

  tbody.innerHTML = '';
  let debito = 0;
  let credito = 0;

  const dadosFiltrados = dadosFinanceiros.filter(item => {
    const [ano, mes] = item.data.split('-');
    return (!filtroMes || mes === filtroMes) && (!filtroAno || ano === filtroAno);
  });

  dadosFiltrados.forEach(item => {
    const tr = document.createElement('tr');
    const valorDebito = item.tipo === 'despesa' ? item.valor.toFixed(2) : '';
    const valorCredito = item.tipo === 'receita' ? item.valor.toFixed(2) : '';

    if (item.tipo === 'despesa') debito += item.valor;
    if (item.tipo === 'receita') credito += item.valor;

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
  valorInvestimento.textContent = `R$ ${(credito - debito).toFixed(2)}`;

  localStorage.setItem('financeiros', JSON.stringify(dadosFinanceiros));
}

function editarRegistro(id) {
  const item = dadosFinanceiros.find(i => i.id === id);
  if (item) {
    document.getElementById('descricao').value = item.descricao;
    document.getElementById('valor').value = item.valor;
    document.getElementById('tipo').value = item.tipo;
    document.getElementById('data').value = item.data;
    dadosFinanceiros = dadosFinanceiros.filter(i => i.id !== id);
    atualizarTabela();
  }
}

function removerRegistro(id) {
  if (confirm('Deseja realmente remover este registro?')) {
    dadosFinanceiros = dadosFinanceiros.filter(i => i.id !== id);
    localStorage.setItem('financeiros', JSON.stringify(dadosFinanceiros));
    atualizarTabela();
  }
}

function aplicarFiltro() {
  filtroMes = document.getElementById('filtro-mes').value;
  filtroAno = document.getElementById('filtro-ano').value;
  atualizarTabela();
}

function preencherFiltroAno() {
  const selectAno = document.getElementById('filtro-ano');
  const anos = [...new Set(dadosFinanceiros.map(i => i.data.split('-')[0]))];
  selectAno.innerHTML = '<option value="">Todos</option>';
  anos.sort().forEach(ano => {
    const opt = document.createElement('option');
    opt.value = ano;
    opt.textContent = ano;
    selectAno.appendChild(opt);
  });
}

function exportarPlanilha() {
  let csv = 'ID,Descrição,Débito (R$),Crédito (R$),Data\n';
  let totalDebito = 0;
  let totalCredito = 0;

  const dadosFiltrados = dadosFinanceiros.filter(item => {
    const [ano, mes] = item.data.split('-');
    return (!filtroMes || mes === filtroMes) && (!filtroAno || ano === filtroAno);
  });

  dadosFiltrados.forEach(item => {
    const debito = item.tipo === 'despesa' ? item.valor.toFixed(2) : '';
    const credito = item.tipo === 'receita' ? item.valor.toFixed(2) : '';
    if (item.tipo === 'despesa') totalDebito += item.valor;
    if (item.tipo === 'receita') totalCredito += item.valor;

    csv += `${item.id},"${item.descricao}",${debito},${credito},${item.data}\n`;
  });

  const investimento = (totalCredito - totalDebito).toFixed(2);
  csv += `,Totais,R$ ${totalDebito.toFixed(2)},R$ ${totalCredito.toFixed(2)},\n`;
  csv += `,Valor para investimento,,R$ ${investimento},\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'balancete-contabil.csv';
  link.click();
}

function imprimirPlanilha() {
  const win = window.open('', '', 'width=900,height=700');
  let debito = 0;
  let credito = 0;

  const dadosFiltrados = dadosFinanceiros.filter(item => {
    const [ano, mes] = item.data.split('-');
    return (!filtroMes || mes === filtroMes) && (!filtroAno || ano === filtroAno);
  });

  let html = `
    <html><head><title>Balancete Contábil</title>
      <style>
        body { font-family: Arial; padding: 30px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
        th { background-color: #1565c0; color: white; }
        tfoot td { font-weight: bold; background-color: #e8f5e9; }
        .investimento-print { margin-top: 1rem; text-align: right; font-size: 1.1rem; }
      </style>
    </head><body>
      <h2>Balancete Contábil<br>Período: ${filtroMes || 'Todos'}/${filtroAno || 'Todos'}</h2>
      <table><thead>
        <tr><th>ID</th><th>Descrição</th><th>Débito (R$)</th><th>Crédito (R$)</th><th>Data</th></tr>
      </thead><tbody>`;

  dadosFiltrados.forEach(item => {
    const debitoVal = item.tipo === 'despesa' ? item.valor.toFixed(2) : '';
    const creditoVal = item.tipo === 'receita' ? item.valor.toFixed(2) : '';
    if (item.tipo === 'despesa') debito += item.valor;
    if (item.tipo === 'receita') credito += item.valor;

    html += `<tr>
      <td>${item.id}</td>
      <td>${item.descricao}</td>
      <td>${debitoVal ? 'R$ ' + debitoVal : ''}</td>
      <td>${creditoVal ? 'R$ ' + creditoVal : ''}</td>
      <td>${item.data}</td>
    </tr>`;
  });

  const investimento = (credito - debito).toFixed(2);

  html += `
    </tbody><tfoot>
      <tr><td colspan="2">Totais</td>
      <td>R$ ${debito.toFixed(2)}</td>
      <td>R$ ${credito.toFixed(2)}</td>
      <td></td></tr>
    </tfoot></table>
    <div class="investimento-print">
      <strong>Valor disponível para investimento: R$ ${investimento}</strong>
    </div>
    </body></html>`;

  win.document.write(html);
  win.document.close();
  win.print();
}

function tocarSom(id) {
  const som = document.getElementById(id);
  if (som) som.play();
}

// Inicializar filtros e tabela
preencherFiltroAno();
atualizarTabela();
