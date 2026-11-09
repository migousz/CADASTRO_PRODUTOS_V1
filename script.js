class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const CHAVE_ESTOQUE = "sistema_estoque_produtos";

let listaDeProdutos = [];
let indiceEdicao = null;

// Elementos do HTML
const formProduto = document.getElementById("formProduto");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const campoBusca = document.getElementById("campo-busca");
const btnAdicionar = document.getElementById("btnAdicionar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const btnLimpar = document.getElementById("btnLimpar");
const tabelaProdutos = document.getElementById("tabelaProdutos");
const valorTotal = document.getElementById("valorTotal");

// Carrega os produtos salvos no navegador
function carregarProdutos() {
    try {
        const dados = localStorage.getItem(CHAVE_ESTOQUE);
        const produtosSalvos = dados ? JSON.parse(dados) : [];

        listaDeProdutos = Array.isArray(produtosSalvos)
            ? produtosSalvos
            : [];
    } catch (erro) {
        console.error("Erro ao carregar os produtos:", erro);
        listaDeProdutos = [];
    }

    renderizarTabela();
}

// Salva os produtos no navegador
function salvarProdutos() {
    localStorage.setItem(
        CHAVE_ESTOQUE,
        JSON.stringify(listaDeProdutos)
    );
}

// Retorna somente os produtos que correspondem à pesquisa
function obterProdutosFiltrados() {
    const termoBusca = campoBusca.value.trim().toLowerCase();

    return listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca)
    );
}

// Pesquisa os produtos enquanto o usuário digita
campoBusca.addEventListener("input", function() {
    renderizarTabela();
});

// Valida, cadastra ou atualiza o produto
formProduto.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = campoNome.value.trim();
    const preco = Number(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);

    // Validação do nome
    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        campoNome.focus();
        return;
    }

    // Validação do preço e da quantidade
    if (
        campoPreco.value.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0 ||
        campoQuantidade.value.trim() === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        alert(
            "O preço deve ser maior que zero e a quantidade deve ser um número inteiro maior que zero."
        );
        return;
    }

    const novoProduto = new Produto(nome, preco, quantidade);

    // Inclusão ou atualização
    if (indiceEdicao === null) {
        listaDeProdutos.push(novoProduto);
        alert("Produto cadastrado com sucesso!");
    } else {
        listaDeProdutos[indiceEdicao] = novoProduto;
        alert("Produto atualizado com sucesso!");
    }

    salvarProdutos();

    indiceEdicao = null;
    formProduto.reset();
    btnAdicionar.textContent = "Adicionar produto";
    btnCancelarEdicao.hidden = true;

    renderizarTabela();
});

// Prepara o formulário para editar um produto
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    indiceEdicao = index;
    btnAdicionar.textContent = "Salvar Alterações";
    btnCancelarEdicao.hidden = false;

    campoNome.focus();
}

// Cancela o modo de edição
btnCancelarEdicao.addEventListener("click", function() {
    indiceEdicao = null;
    formProduto.reset();
    btnAdicionar.textContent = "Adicionar produto";
    btnCancelarEdicao.hidden = true;
});

// Remove um produto
function removerProduto(index) {
    if (!listaDeProdutos[index]) {
        return;
    }

    const confirmar = confirm(
        `Deseja remover o produto "${listaDeProdutos[index].nome}"?`
    );

    if (!confirmar) {
        return;
    }

    listaDeProdutos.splice(index, 1);

    // Ajusta o índice se um produto for removido durante a edição
    if (indiceEdicao === index) {
        indiceEdicao = null;
        formProduto.reset();
        btnAdicionar.textContent = "Adicionar produto";
        btnCancelarEdicao.hidden = true;
    } else if (indiceEdicao !== null && indiceEdicao > index) {
        indiceEdicao--;
    }

    salvarProdutos();
    renderizarTabela();
}

// Calcula o total considerando apenas os produtos visíveis
function atualizarValorTotal(produtosVisiveis) {
    const total = produtosVisiveis.reduce(
        (soma, produto) =>
            soma + Number(produto.preco) * Number(produto.quantidade),
        0
    );

    valorTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Renderiza a tabela com os produtos filtrados
function renderizarTabela() {
    tabelaProdutos.innerHTML = "";

    const produtosVisiveis = obterProdutosFiltrados();

    if (produtosVisiveis.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;

        if (listaDeProdutos.length === 0) {
            celula.textContent = "Nenhum produto cadastrado ainda.";
        } else {
            celula.textContent = "Nenhum produto encontrado.";
        }

        celula.className = "mensagem-vazia";

        linha.appendChild(celula);
        tabelaProdutos.appendChild(linha);
    } else {
        produtosVisiveis.forEach(produto => {
            const linha = document.createElement("tr");

            // Recupera a posição original na lista principal
            const index = listaDeProdutos.indexOf(produto);

            const valores = [
                produto.nome,
                Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }),
                produto.quantidade,
                (
                    Number(produto.preco) *
                    Number(produto.quantidade)
                ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                })
            ];

            valores.forEach(valor => {
                const celula = document.createElement("td");
                celula.textContent = valor;
                linha.appendChild(celula);
            });

            const celulaAcoes = document.createElement("td");

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.textContent = "Editar";
            btnEditar.className = "btn-editar";

            btnEditar.addEventListener("click", function() {
                prepararEdicao(index);
            });

            const btnRemover = document.createElement("button");
            btnRemover.type = "button";
            btnRemover.textContent = "Remover";
            btnRemover.className = "btn-remover";

            btnRemover.addEventListener("click", function() {
                removerProduto(index);
            });

            celulaAcoes.append(btnEditar, btnRemover);
            linha.appendChild(celulaAcoes);
            tabelaProdutos.appendChild(linha);
        });
    }

    atualizarValorTotal(produtosVisiveis);
}

// Limpa todos os produtos cadastrados
btnLimpar.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        alert("O estoque já está vazio.");
        return;
    }

    if (confirm("Tem certeza de que deseja limpar todo o estoque?")) {
        listaDeProdutos = [];
        indiceEdicao = null;

        formProduto.reset();
        campoBusca.value = "";
        btnAdicionar.textContent = "Adicionar produto";
        btnCancelarEdicao.hidden = true;

        salvarProdutos();
        renderizarTabela();
    }
});

// Inicialização do sistema
carregarProdutos();