// Função auxiliar para pegar produtos do localStorage
function getProdutos() {
    return JSON.parse(localStorage.getItem("produtos")) || [];
}

// Renderiza o histórico
function renderizarHistorico() {
    const lista = getProdutos();
    const container = document.getElementById("listaHistorico");

    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = `<p class="text-muted mt-3">Nenhum produto cadastrado ainda.</p>`;
        return;
    }

    let totalInvestido = 0;
    let totalVendido = 0;
    let totalLucro = 0;

    const nomes = [];
    const lucros = [];

    lista.forEach(produto => {
        const unidadesTotais = produto.quantidade * produto.qtdPorPacote;
        const valorInvestido = produto.valorPacote * produto.quantidade;
        const valorVendido = produto.valorUnidade * unidadesTotais;
        const lucro = valorVendido - valorInvestido;

        totalInvestido += valorInvestido;
        totalVendido += valorVendido;
        totalLucro += lucro;

        nomes.push(produto.nome);
        lucros.push(lucro);

        const card = document.createElement("div");
        card.className = "col-12 col-sm-6 col-md-4 col-lg-3";

        card.innerHTML = `
            <div class="card produto-card shadow-sm h-100">
                <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem">
                <div class="card-body text-start">
                    <h5 class="card-title fw-bold text-center mb-2">${produto.nome}</h5>
                    <ul class="list-unstyled mb-2">
                        <li><strong>Vendidos:</strong> ${unidadesTotais}</li>
                        <li><strong>Investido:</strong> R$ ${valorInvestido.toFixed(2)}</li>
                        <li><strong>Lucro:</strong> 
                            <span class="${lucro >= 0 ? 'text-success' : 'text-danger'}">
                                R$ ${lucro.toFixed(2)}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    document.getElementById("valorInvestido").textContent = `R$ ${totalInvestido.toFixed(2)}`;
    document.getElementById("valorVendido").textContent = `R$ ${totalVendido.toFixed(2)}`;
    document.getElementById("lucroTotal").textContent = `R$ ${totalLucro.toFixed(2)}`;

    gerarGrafico(nomes, lucros);
}

// Gera o gráfico com Chart.js
function gerarGrafico(labels, dados) {
    const ctx = document.getElementById("graficoVendas");
    if (!ctx) return;

    new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Lucro por Produto (R$)",
                data: dados,
                borderWidth: 1,
                backgroundColor: "rgba(247, 143, 179, 0.6)",
                borderColor: "#f78fb3"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Inicializa
renderizarHistorico();