function getProdutos() {
    return JSON.parse(localStorage.getItem("produtos")) || [];
}

function getHistorico() {
    return JSON.parse(localStorage.getItem("historicoVendas")) || [];
}

function renderizarHistorico() {
    const produtos = getProdutos();
    const historico = getHistorico();

    const container = document.getElementById("listaHistorico");
    container.innerHTML = "";

    if (produtos.length === 0) {
        container.innerHTML = `<p class="text-muted mt-3">Nenhum produto cadastrado ainda.</p>`;
        return;
    }

    let totalInvestido = 0;
    let totalVendido = 0;
    let lucroTotal = 0;

    // === ARRAYS PARA O GRÁFICO (mais vendidos) ===
    const labels = [];
    const dados = [];

    produtos.forEach(produto => {

        const vendasProduto = historico.filter(v => v.nome === produto.nome);
        const quantidadeVendida = vendasProduto.length;

        // Sempre mostra no gráfico, mesmo se nunca vendeu (quantidade 0)
        labels.push(produto.nome);
        dados.push(quantidadeVendida);

        if (quantidadeVendida === 0) return;

        const valorVendido = vendasProduto.reduce((s, v) => s + v.valor, 0);
        const precoUnitarioDeCompra = produto.valorPacote / produto.qtdPorPacote;
        const valorInvestido = precoUnitarioDeCompra * quantidadeVendida;

        const lucro = valorVendido - valorInvestido;

        totalInvestido += valorInvestido;
        totalVendido += valorVendido;
        lucroTotal += lucro;

        // Criar card somente para quem vendeu
        const card = document.createElement("div");
        card.className = "col-12 col-sm-6 col-md-4 col-lg-3";
        card.innerHTML = `
            <div class="card produto-card shadow-sm h-100">
                <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem">

                <div class="card-body text-start">
                    <h5 class="card-title fw-bold text-center mb-2">${produto.nome}</h5>
                    <ul class="list-unstyled mb-2">
                        <li><strong>Vendidas:</strong> ${quantidadeVendida} unidades</li>
                        <li><strong>Investimento:</strong> R$ ${valorInvestido.toFixed(2)}</li>
                        <li><strong>Valor Vendido:</strong> R$ ${valorVendido.toFixed(2)}</li>
                        <li><strong>Lucro:</strong>
                            <span class="${lucro >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}">
                                R$ ${lucro.toFixed(2)}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Totais
    document.getElementById("valorInvestido").textContent = `R$ ${totalInvestido.toFixed(2)}`;
    document.getElementById("valorVendido").textContent = `R$ ${totalVendido.toFixed(2)}`;
    document.getElementById("lucroTotal").textContent = `R$ ${lucroTotal.toFixed(2)}`;

    // Gerar gráfico final
    gerarGrafico(labels, dados);
}

function gerarGrafico(labels, dados) {
    const ctx = document.getElementById("graficoVendas");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Unidades Vendidas",
                data: dados,
                backgroundColor: "rgba(247, 143, 179, 0.6)",
                borderColor: "#f78fb3",
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // OBRIGATÓRIO
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

renderizarHistorico();