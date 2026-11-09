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

// ELEMENTOS HTML
const formProduto = document.getElementById("formProduto");

const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");

const btnAdicionar = document.getElementById("btnAdicionar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const btnLimpar = document.getElementById("btnLimpar");

const tabelaProdutos = document.getElementById("tabelaProdutos");
const valorTotal = document.getElementById("valorTotal");

const campoBusca = document.getElementById("campo-busca");
const sugestoesProdutos = document.getElementById("sugestoesProdutos");


// CARREGAR PRODUTOS
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


// SALVAR PRODUTOS
function salvarProdutos() {
    localStorage.setItem(
        CHAVE_ESTOQUE,
        JSON.stringify(listaDeProdutos)
    );
}


// BUSCAR PRODUTOS EXISTENTES PELO NOME
function buscarProdutosExistentes() {
    const termo = campoNome.value.trim().toLowerCase();

    sugestoesProdutos.innerHTML = "";

    if (termo === "" || indiceEdicao !== null) {
        sugestoesProdutos.classList.remove("ativo");
        return;
    }

    const produtosEncontrados = listaDeProdutos
        .map((produto, index) => ({ produto, index }))
        .filter(item =>
            item.produto.nome.toLowerCase().includes(termo)
        );

    if (produtosEncontrados.length === 0) {
        sugestoesProdutos.classList.remove("ativo");
        return;
    }

    produtosEncontrados.forEach(item => {
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "sugestao-item";

        const nome = document.createElement("strong");
        nome.textContent = item.produto.nome;

        const detalhes = document.createElement("span");

        detalhes.textContent =
            `Preço: ${Number(item.produto.preco).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })} | Quantidade: ${item.produto.quantidade}`;

        botao.append(nome, detalhes);

        botao.addEventListener("click", function() {
            prepararEdicao(item.index);

            sugestoesProdutos.innerHTML = "";
            sugestoesProdutos.classList.remove("ativo");
        });

        sugestoesProdutos.appendChild(botao);
    });

    sugestoesProdutos.classList.add("ativo");
}


// ATUALIZAR SUGESTÕES ENQUANTO DIGITA
campoNome.addEventListener("input", function() {
    buscarProdutosExistentes();
});


// CADASTRAR OU ATUALIZAR PRODUTO
formProduto.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = campoNome.value.trim();
    const preco = Number(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);

    // VALIDAR NOME
    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        campoNome.focus();
        return;
    }

    // VALIDAR PREÇO E QUANTIDADE
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

    // MODO CADASTRO
    if (indiceEdicao === null) {

        // VERIFICAR SE O PRODUTO JÁ EXISTE
        const produtoExistente = listaDeProdutos.findIndex(produto =>
            produto.nome.trim().toLowerCase() === nome.toLowerCase()
        );

        if (produtoExistente !== -1) {
            alert(
                "Esse produto já está cadastrado. Selecione-o nas sugestões para editar."
            );

            prepararEdicao(produtoExistente);
            return;
        }

        listaDeProdutos.push(novoProduto);

        alert("Produto cadastrado com sucesso!");

    } else {

        // MODO EDIÇÃO
        listaDeProdutos[indiceEdicao] = novoProduto;

        alert("Produto atualizado com sucesso!");
    }

    salvarProdutos();

    cancelarEdicao();
    renderizarTabela();
});


// PREPARAR EDIÇÃO
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    // PREENCHER CAMPOS COM OS DADOS EXISTENTES
    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    // ATIVAR MODO EDIÇÃO
    indiceEdicao = index;

    btnAdicionar.textContent = "Salvar alterações";
    btnCancelarEdicao.hidden = false;

    sugestoesProdutos.innerHTML = "";
    sugestoesProdutos.classList.remove("ativo");

    campoPreco.focus();
}


// CANCELAR EDIÇÃO
function cancelarEdicao() {
    indiceEdicao = null;

    formProduto.reset();

    btnAdicionar.textContent = "Adicionar produto";
    btnCancelarEdicao.hidden = true;

    sugestoesProdutos.innerHTML = "";
    sugestoesProdutos.classList.remove("ativo");
}


// EVENTO DO BOTÃO CANCELAR
btnCancelarEdicao.addEventListener("click", function() {
    cancelarEdicao();
});


// REMOVER PRODUTO
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

    // AJUSTAR MODO DE EDIÇÃO
    if (indiceEdicao === index) {
        cancelarEdicao();

    } else if (indiceEdicao !== null && indiceEdicao > index) {
        indiceEdicao--;
    }

    salvarProdutos();
    renderizarTabela();
}


// FILTRAR PRODUTOS DA TABELA
function obterProdutosFiltrados() {
    const termoBusca = campoBusca.value.trim().toLowerCase();

    return listaDeProdutos
        .map((produto, index) => ({ produto, index }))
        .filter(item =>
            item.produto.nome.toLowerCase().includes(termoBusca)
        );
}


// ATUALIZAR VALOR TOTAL DOS PRODUTOS VISÍVEIS
function atualizarValorTotal(produtosVisiveis) {
    const total = produtosVisiveis.reduce(
        (soma, item) =>
            soma +
            Number(item.produto.preco) *
            Number(item.produto.quantidade),
        0
    );

    valorTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// RENDERIZAR TABELA
function renderizarTabela() {
    tabelaProdutos.innerHTML = "";

    const produtosVisiveis = obterProdutosFiltrados();

    // VERIFICAR SE EXISTEM PRODUTOS
    if (produtosVisiveis.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;

        celula.textContent = listaDeProdutos.length === 0
            ? "Nenhum produto cadastrado ainda."
            : "Nenhum produto encontrado.";

        celula.className = "mensagem-vazia";

        linha.appendChild(celula);
        tabelaProdutos.appendChild(linha);

    } else {

        // MOSTRAR PRODUTOS FILTRADOS
        produtosVisiveis.forEach(item => {
            const produto = item.produto;
            const index = item.index;

            const linha = document.createElement("tr");

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

            // CRIAR CÉLULAS
            valores.forEach(valor => {
                const celula = document.createElement("td");

                celula.textContent = valor;

                linha.appendChild(celula);
            });

            // CÉLULA DE AÇÕES
            const celulaAcoes = document.createElement("td");

            // BOTÃO EDITAR
            const btnEditar = document.createElement("button");

            btnEditar.type = "button";
            btnEditar.textContent = "Editar";
            btnEditar.className = "btn-editar";

            btnEditar.addEventListener("click", function() {
                prepararEdicao(index);
            });

            // BOTÃO REMOVER
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

    // ATUALIZAR TOTAL
    atualizarValorTotal(produtosVisiveis);
}


// BUSCA EM TEMPO REAL NA TABELA
campoBusca.addEventListener("input", function() {
    renderizarTabela();
});


// LIMPAR TODO O ESTOQUE
btnLimpar.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        alert("O estoque já está vazio.");
        return;
    }

    if (confirm("Tem certeza de que deseja limpar todo o estoque?")) {

        listaDeProdutos = [];

        cancelarEdicao();

        campoBusca.value = "";

        salvarProdutos();
        renderizarTabela();
    }
});


// INICIAR SISTEMA
carregarProdutos();