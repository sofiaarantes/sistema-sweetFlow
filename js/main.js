function getProdutos() {
    return JSON.parse(localStorage.getItem("produtos")) || [];
}

function salvarProdutos(lista) {
    localStorage.setItem("produtos", JSON.stringify(lista));
}

function getHistorico() {
    return JSON.parse(localStorage.getItem("historicoVendas")) || [];
}

function salvarHistorico(lista) {
    localStorage.setItem("historicoVendas", JSON.stringify(lista));
}

function renderizarProdutosVenda() {
    const lista = getProdutos();
    const container = document.getElementById("listaProdutosVenda");
    const mensagem = document.getElementById("mensagemVazia");

    container.innerHTML = "";

    if (lista.length === 0) {
        mensagem.textContent = "Nenhum produto cadastrado ainda.";
        return;
    }

    mensagem.textContent = "";

    lista.forEach((produto, index) => {
        const totalUnidadesCompradas = produto.quantidade * produto.qtdPorPacote;
        const unidadesVendidas = produto.vendidos || 0;
        const unidadesDisponiveis = totalUnidadesCompradas - unidadesVendidas;

        const card = document.createElement("div");
        card.className = "col-12 col-sm-6 col-md-4 col-lg-3";
        
        const botaoDisabled = unidadesDisponiveis <= 0 ? 'disabled' : '';
        const textoBotao = unidadesDisponiveis <= 0 ? 'Esgotado' : 'Vender 1 Unidade';

        card.innerHTML = `
            <div class="card produto-card shadow-sm h-100 d-flex flex-column">
                <img src="${produto.imagem}" alt="${produto.nome}" class="card-img-top produto-imagem">
                <div class="card-body text-start d-flex flex-column justify-content-between">
                    
                    <div>
                        <h5 class="card-title fw-bold text-center mb-2">${produto.nome}</h5>
                        <ul class="list-unstyled mb-3">
                            <li><strong>Preço Unidade:</strong> <span class="text-success fw-bold">R$ ${produto.valorUnidade.toFixed(2)}</span></li>
                            <li><strong>Em Estoque:</strong> ${unidadesDisponiveis} unidades</li>
                        </ul>
                    </div>
                    
                    <button class="btn btn-primary w-100" onclick="venderProduto(${index})" ${botaoDisabled}>
                        ${textoBotao}
                    </button>
                    
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}


function venderProduto(index) {
    const lista = getProdutos();
    const produto = lista[index];

    const totalUnidadesCompradas = produto.quantidade * produto.qtdPorPacote;

    if (produto.vendidos >= totalUnidadesCompradas) {
        alert("Produto esgotado!");
        return;
    }

    produto.vendidos++;

    salvarProdutos(lista);

    const historico = getHistorico();
    const novoRegistro = {
        nome: produto.nome,
        valor: produto.valorUnidade,
        data: new Date().toISOString()
    };
    historico.push(novoRegistro);
    salvarHistorico(historico);

    renderizarProdutosVenda();
    
    alert(`Venda de 1 "${produto.nome}" registrada com sucesso!`);
}

renderizarProdutosVenda();