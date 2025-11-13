// Funções auxiliares
function getProdutos() {
    return JSON.parse(localStorage.getItem("produtos")) || [];
}

function salvarProdutos(lista) {
    localStorage.setItem("produtos", JSON.stringify(lista));
}

// Renderiza produtos
function renderizarProdutos() {
    const lista = getProdutos();
    const container = document.getElementById("listaProdutos");
    const mensagem = document.getElementById("mensagemVazia");
    const btnRemoverTodos = document.getElementById("btnRemoverTodos");

    container.innerHTML = "";

    if (lista.length === 0) {
        mensagem.textContent = "Nenhum produto foi adicionado ainda.";
        btnRemoverTodos.classList.add("d-none");
        return;
    }

    mensagem.textContent = "";
    btnRemoverTodos.classList.remove("d-none");

    lista.forEach((produto, index) => {
        const totalUnidades = produto.quantidade * produto.qtdPorPacote;
        const valorInvestido = produto.quantidade * produto.valorPacote;
        const valorTotal = totalUnidades * produto.valorUnidade;
        const lucro = valorTotal - valorInvestido;

        const card = document.createElement("div");
        card.className = "col-12 col-sm-6 col-md-4 col-lg-3";

        card.innerHTML = `
            <div class="card produto-card shadow-sm h-100 d-flex flex-column justify-content-between">
                <img src="${produto.imagem}" alt="${produto.nome}" class="card-img-top produto-imagem">
                <div class="card-body text-start">
                    <h5 class="card-title fw-bold text-center mb-2">${produto.nome}</h5>
                    <ul class="list-unstyled mb-3">
                        <li><strong>Valor Pacote:</strong> R$ ${produto.valorPacote.toFixed(2)}</li>
                        <li><strong>Valor Unidade:</strong> R$ ${produto.valorUnidade.toFixed(2)}</li>
                        <li><strong>Pacotes:</strong> ${produto.quantidade}</li>
                        <li><strong>Unidades:</strong> ${totalUnidades}</li>
                        <li><strong>Investido:</strong> <span class="text-success">R$ ${valorInvestido.toFixed(2)}</span></li>
                        <li><strong>Total:</strong> <span class="text-primary">R$ ${valorTotal.toFixed(2)}</span></li>
                        <li><strong>Lucro:</strong> <span class="${lucro >= 0 ? 'text-success' : 'text-danger'}">R$ ${lucro.toFixed(2)}</span></li>
                    </ul>
                </div>

                <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-outline-primary btn-sm btn-quantidade" onclick="alterarQuantidade(${index}, -1)">➖</button>
                        <span class="fw-bold">${produto.quantidade}</span>
                        <button class="btn btn-outline-primary btn-sm btn-quantidade" onclick="alterarQuantidade(${index}, 1)">➕</button>
                    </div>

                    <button class="btn btn-danger btn-sm" onclick="removerProduto(${index})">Remover</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}


// Adiciona produto
document.getElementById("formProduto").addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const imagemInput = document.getElementById("imagem");
    const valorPacote = parseFloat(document.getElementById("valorPacote").value);
    const qtdPorPacote = parseInt(document.getElementById("qtdPacote").value);
    const valorUnidade = parseFloat(document.getElementById("valorUnidade").value);
    const pacotesComprados = parseInt(document.getElementById("qtdComprada").value);

    if (!imagemInput.files[0]) {
        alert("Por favor, selecione uma imagem do produto!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const imagemBase64 = event.target.result;

        const novoProduto = {
            nome,
            imagem: imagemBase64,
            valorPacote,
            valorUnidade,
            qtdPorPacote,
            quantidade: pacotesComprados,
            vendidos: 0
        };

        const lista = getProdutos();
        lista.push(novoProduto);
        salvarProdutos(lista);

        document.getElementById("formProduto").reset();
        renderizarProdutos();

        const collapse = bootstrap.Collapse.getInstance(document.getElementById('formContainer'));
        collapse.hide();

        alert("Produto adicionado com sucesso!");
    };

    reader.readAsDataURL(imagemInput.files[0]);
});

// Altera quantidade de pacotes
function alterarQuantidade(index, delta) {
    const lista = getProdutos();
    lista[index].quantidade += delta;
    if (lista[index].quantidade < 0) lista[index].quantidade = 0;
    salvarProdutos(lista);
    renderizarProdutos();
}

// Remove produto individual
function removerProduto(index) {
    if (confirm("Deseja remover este produto?")) {
        const lista = getProdutos();
        lista.splice(index, 1);
        salvarProdutos(lista);
        renderizarProdutos();
    }
}

// Remove todos
document.getElementById("btnRemoverTodos").addEventListener("click", () => {
    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        localStorage.removeItem("produtos");
        renderizarProdutos();
    }
});

// Inicializa
renderizarProdutos();