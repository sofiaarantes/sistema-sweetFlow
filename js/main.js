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

let carrinho = [];

function limparCarrinho() {
    carrinho = [];
}

function renderizarCarrinho() {
    const listaProdutos = getProdutos();
    const container = document.getElementById("itensCarrinho");
    const contadorCarrinho = document.getElementById("contadorCarrinho");
    const valorTotalElement = document.getElementById("valorTotalCarrinho");
    const mensagemVazia = document.getElementById("carrinhoVazioMensagem");
    const btnFinalizar = document.getElementById("btnFinalizarVenda");

    container.innerHTML = "";

    const carrinhoAgrupado = carrinho.reduce((acc, item) => {
        const produtoOriginal = listaProdutos.find(p => p.nome === item.nome);

        if (!acc[item.nome]) {
            acc[item.nome] = {
                nome: item.nome,
                valorUnidade: produtoOriginal ? produtoOriginal.valorUnidade : 0,
                quantidade: 0,
                indiceProduto: listaProdutos.findIndex(p => p.nome === item.nome)
            };
        }
        acc[item.nome].quantidade++;
        return acc;
    }, {});

    const itensAgrupados = Object.values(carrinhoAgrupado);
    let totalCarrinho = 0;
    let totalItens = 0;

    if (itensAgrupados.length === 0) {
        mensagemVazia.classList.remove("d-none");
        btnFinalizar.disabled = true;
    } else {
        mensagemVazia.classList.add("d-none");
        btnFinalizar.disabled = false;

        itensAgrupados.forEach(item => {
            const valorTotalItem = item.quantidade * item.valorUnidade;
            totalCarrinho += valorTotalItem;
            totalItens += item.quantidade;

            const itemElement = document.createElement("div");
            itemElement.className = "list-group-item d-flex justify-content-between align-items-center";

            itemElement.innerHTML = `
                <div>
                    ${item.nome} 
                    <span class="badge bg-primary rounded-pill">${item.quantidade}x</span>
                    <small class="text-muted"> (R$ ${item.valorUnidade.toFixed(2)}/un)</small>
                </div>
                <div>
                    <span class="fw-bold me-2">R$ ${valorTotalItem.toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="removerItemCarrinho(${item.indiceProduto})">
                        &times;
                    </button>
                </div>
            `;
            container.appendChild(itemElement);
        });
    }

    contadorCarrinho.textContent = totalItens;
    valorTotalElement.textContent = `R$ ${totalCarrinho.toFixed(2)}`;
}

function adicionarAoCarrinho(index) {
    const lista = getProdutos();
    const produto = lista[index];

    const totalUnidadesCompradas = produto.quantidade * produto.qtdPorPacote;
    const unidadesVendidasNoEstoque = produto.vendidos || 0;
    const unidadesDisponiveisNoEstoque = totalUnidadesCompradas - unidadesVendidasNoEstoque;

    const unidadesNoCarrinho = carrinho.filter(item => item.nome === produto.nome).length;

    if (unidadesNoCarrinho >= unidadesDisponiveisNoEstoque) {
        alert("Não há estoque suficiente deste produto para adicionar ao carrinho!");
        return;
    }

    carrinho.push({
        nome: produto.nome,
        indice: index
    });

    renderizarProdutosVenda();
    renderizarCarrinho();
}

function removerItemCarrinho(index) {
    const lista = getProdutos();
    const produto = lista[index];

    const indiceNoCarrinho = carrinho.findIndex(item => item.nome === produto.nome);

    if (indiceNoCarrinho !== -1) {
        carrinho.splice(indiceNoCarrinho, 1);
        renderizarCarrinho();
        renderizarProdutosVenda();
    }
}

function finalizarVenda() {
    if (carrinho.length === 0) {
        alert("O carrinho está vazio.");
        return;
    }

    if (!confirm("Deseja finalizar a venda e registrar todos os itens do carrinho?")) {
        return;
    }

    const listaProdutos = getProdutos();
    const historico = getHistorico();
    const dataVenda = new Date().toISOString();
    let totalVenda = 0;

    carrinho.forEach(itemCarrinho => {
        const produto = listaProdutos.find(p => p.nome === itemCarrinho.nome);

        if (produto) {
            produto.vendidos = (produto.vendidos || 0) + 1;

            const novoRegistro = {
                nome: produto.nome,
                valor: produto.valorUnidade,
                data: dataVenda
            };
            historico.push(novoRegistro);
            totalVenda += produto.valorUnidade;
        }
    });

    salvarProdutos(listaProdutos);
    salvarHistorico(historico);

    limparCarrinho();
    renderizarProdutosVenda();
    renderizarCarrinho();

    const modalElement = document.getElementById('carrinhoModal');
    if (typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }

    alert(`Venda finalizada com sucesso! Total: R$ ${totalVenda.toFixed(2)}.`);
}

function venderProduto(index) {
    const lista = getProdutos();
    const produto = lista[index];

    const totalUnidadesCompradas = produto.quantidade * produto.qtdPorPacote;
    const unidadesVendidas = produto.vendidos || 0;

    const unidadesNoCarrinho = carrinho.filter(item => item.nome === produto.nome).length;
    const estoqueDisponivelReal = totalUnidadesCompradas - unidadesVendidas - unidadesNoCarrinho;

    if (estoqueDisponivelReal <= 0) {
        alert("Produto esgotado (ou já reservado no carrinho)!");
        return;
    }

    if (!confirm(`Deseja registrar a venda de 1 unidade de "${produto.nome}" (R$ ${produto.valorUnidade.toFixed(2)}) imediatamente?`)) {
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
                const unidadesVendidasNoEstoque = produto.vendidos || 0;
                const unidadesDisponiveisNoEstoque = totalUnidadesCompradas - unidadesVendidasNoEstoque;

                const unidadesNoCarrinho = carrinho.filter(item => item.nome === produto.nome).length;
                const unidadesRestantes = unidadesDisponiveisNoEstoque - unidadesNoCarrinho;

                const card = document.createElement("div");
                card.className = "col-12 col-sm-6 col-md-4 col-lg-3";

                const botaoCarrinhoDisabled = unidadesRestantes <= 0 ? 'disabled' : '';
                const textoBotaoCarrinho = unidadesRestantes <= 0 ? 'Esgotado' : '🛒 Add Carrinho';

                const botaoVenderDisabled = unidadesRestantes <= 0 ? 'disabled' : '';
                const textoBotaoVender = 'Vender Agora';


                card.innerHTML = `
            <div class="card produto-card shadow-sm h-100 d-flex flex-column">
                <img src="${produto.imagem}" alt="${produto.nome}" class="card-img-top produto-imagem">
                <div class="card-body text-start d-flex flex-column justify-content-between">
                    
                    <div>
                        <h5 class="card-title fw-bold text-center mb-2">${produto.nome}</h5>
                        <ul class="list-unstyled mb-3">
                            <li><strong>Preço Unidade:</strong> <span class="text-success fw-bold">R$ ${produto.valorUnidade.toFixed(2)}</span></li>
                            <li><strong>Disponível:</strong> ${unidadesRestantes} unidades</li>
                            ${unidadesNoCarrinho > 0 ? `<li><strong class="text-info">No Carrinho:</strong> ${unidadesNoCarrinho} unidades</li>` : ''}
                        </ul>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" onclick="adicionarAoCarrinho(${index})" ${botaoCarrinhoDisabled}>
                            ${textoBotaoCarrinho}
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="venderProduto(${index})" ${botaoVenderDisabled}>
                            ${textoBotaoVender}
                        </button>
                    </div>
                    
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    document.getElementById("contadorCarrinho").textContent = carrinho.length;
}


document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutosVenda();
    renderizarCarrinho();
    
    document.getElementById("btnFinalizarVenda").addEventListener("click", finalizarVenda);
});