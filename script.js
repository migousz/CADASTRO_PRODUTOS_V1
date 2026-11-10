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
let acaoPendente = null;

// ELEMENTOS HTML
const formProduto = document.getElementById("formProduto");

const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");

const btnAdicionar = document.getElementById("btnAdicionar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const btnLimpar = document.getElementById("btnLimpar");
const btnBootstrap = document.getElementById("btnBootstrap");

const tabelaProdutos = document.getElementById("tabelaProdutos");
const valorTotal = document.getElementById("valorTotal");

const campoBusca = document.getElementById("campo-busca");
const sugestoesProdutos = document.getElementById("sugestoesProdutos");
const mensagemFormulario = document.getElementById("mensagem-erro");

// ELEMENTOS DO MODAL
const modalOverlay = document.getElementById("modalOverlay");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const modalIcone = document.getElementById("modalIcone");

const btnModalCancelar = document.getElementById("btnModalCancelar");
const btnModalConfirmar = document.getElementById("btnModalConfirmar");


// FORMATAR VALORES EM REAIS
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// MOSTRAR MENSAGENS NO FORMULÁRIO
function mostrarMensagem(texto, tipo = "erro") {
    mensagemFormulario.textContent = texto;

    mensagemFormulario.className =
        `mensagem-formulario mensagem-${tipo}`;

    mensagemFormulario.style.display = "block";
}


// ESCONDER MENSAGEM
function esconderMensagem() {
    mensagemFormulario.textContent = "";
    mensagemFormulario.className = "mensagem-formulario";
    mensagemFormulario.style.display = "none";
}


// CARREGAR PRODUTOS
function carregarProdutos() {
    try {
        const dados = localStorage.getItem(CHAVE_ESTOQUE);
        const produtosSalvos = dados ? JSON.parse(dados) : [];

        listaDeProdutos = Array.isArray(produtosSalvos)
            ? produtosSalvos
            : [];

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        listaDeProdutos = [];
    }

    renderizarTabela();
}


// SALVAR PRODUTOS
function salvarProdutos() {
    try {
        localStorage.setItem(
            CHAVE_ESTOQUE,
            JSON.stringify(listaDeProdutos)
        );
    } catch (erro) {
        console.error("Erro ao salvar produtos:", erro);
        mostrarMensagem(
            "Não foi possível salvar os dados no navegador.",
            "erro"
        );
    }
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
            `Preço: ${formatarMoeda(item.produto.preco)} | ` +
            `Quantidade: ${item.produto.quantidade}`;

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
    esconderMensagem();
    buscarProdutosExistentes();
});


// ESCONDER SUGESTÕES AO CLICAR FORA
document.addEventListener("click", function(event) {
    if (!event.target.closest(".campo-nome")) {
        sugestoesProdutos.classList.remove("ativo");
    }
});


// CADASTRAR OU ATUALIZAR PRODUTO
formProduto.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = campoNome.value.trim();
    const preco = Number(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);

    esconderMensagem();

    // VALIDAR NOME
    if (nome === "") {
        mostrarMensagem(
            "Por favor, informe o nome do produto.",
            "erro"
        );

        campoNome.focus();
        return;
    }

    // VALIDAR PREÇO
    if (
        campoPreco.value.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        mostrarMensagem(
            "O preço deve ser um número maior que zero.",
            "erro"
        );

        campoPreco.focus();
        return;
    }

    // VALIDAR QUANTIDADE
    if (
        campoQuantidade.value.trim() === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        mostrarMensagem(
            "A quantidade deve ser um número inteiro maior que zero.",
            "erro"
        );

        campoQuantidade.focus();
        return;
    }

    const novoProduto = new Produto(nome, preco, quantidade);

    // MODO CADASTRO
    if (indiceEdicao === null) {

        const produtoExistente = listaDeProdutos.findIndex(produto =>
            produto.nome.trim().toLowerCase() === nome.toLowerCase()
        );

        if (produtoExistente !== -1) {
            prepararEdicao(produtoExistente);

            mostrarMensagem(
                "Esse produto já existe. Os dados foram carregados para edição.",
                "aviso"
            );

            return;
        }

        listaDeProdutos.push(novoProduto);

        salvarProdutos();

        cancelarEdicao();

        renderizarTabela();

        mostrarMensagem(
            "Produto cadastrado com sucesso!",
            "sucesso"
        );

    } else {

        // MODO EDIÇÃO
        const nomeDuplicado = listaDeProdutos.some((produto, index) =>
            index !== indiceEdicao &&
            produto.nome.trim().toLowerCase() === nome.toLowerCase()
        );

        if (nomeDuplicado) {
            mostrarMensagem(
                "Já existe outro produto com esse nome.",
                "erro"
            );

            campoNome.focus();
            return;
        }

        listaDeProdutos[indiceEdicao] = novoProduto;

        salvarProdutos();

        cancelarEdicao();

        renderizarTabela();

        mostrarMensagem(
            "Produto atualizado com sucesso!",
            "sucesso"
        );
    }
});


// PREPARAR EDIÇÃO
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        mostrarMensagem("Produto não encontrado.", "erro");
        return;
    }

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    indiceEdicao = index;

    btnAdicionar.textContent = "Salvar alterações";
    btnCancelarEdicao.hidden = false;

    sugestoesProdutos.innerHTML = "";
    sugestoesProdutos.classList.remove("ativo");

    esconderMensagem();

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
    esconderMensagem();
});


// ABRIR MODAL PERSONALIZADO
function abrirModal(titulo, texto, tipo, funcaoConfirmar) {
    modalTitulo.textContent = titulo;
    modalTexto.textContent = texto;

    acaoPendente = funcaoConfirmar;

    if (tipo === "conceito") {
        modalIcone.textContent = "NT";
        modalIcone.className = "modal-icone modal-icone-conceito";

        btnModalCancelar.hidden = true;
        btnModalConfirmar.textContent = "Entendi";
        btnModalConfirmar.classList.add("btn-modal-conceito");

    } else {
        modalIcone.textContent = "!";
        modalIcone.className = "modal-icone modal-icone-alerta";

        btnModalCancelar.hidden = false;
        btnModalConfirmar.textContent = "Confirmar";
        btnModalConfirmar.classList.remove("btn-modal-conceito");
    }

    modalOverlay.classList.add("ativo");
    modalOverlay.setAttribute("aria-hidden", "false");

    btnModalConfirmar.focus();
}


// FECHAR MODAL
function fecharModal() {
    modalOverlay.classList.remove("ativo");
    modalOverlay.setAttribute("aria-hidden", "true");

    acaoPendente = null;
}


// BOTÃO CANCELAR DO MODAL
btnModalCancelar.addEventListener("click", function() {
    fecharModal();
});


// BOTÃO CONFIRMAR DO MODAL
btnModalConfirmar.addEventListener("click", function() {
    const acao = acaoPendente;

    fecharModal();

    if (typeof acao === "function") {
        acao();
    }
});


// FECHAR MODAL AO CLICAR FORA DA JANELA
modalOverlay.addEventListener("click", function(event) {
    if (event.target === modalOverlay) {
        fecharModal();
    }
});


// FECHAR MODAL COM ESC
document.addEventListener("keydown", function(event) {
    if (
        event.key === "Escape" &&
        modalOverlay.classList.contains("ativo")
    ) {
        fecharModal();
    }
});


// REMOVER PRODUTO
function removerProduto(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        return;
    }

    abrirModal(
        "Excluir produto",
        `Tem certeza de que deseja excluir "${produto.nome}" do estoque? Essa ação não poderá ser desfeita.`,
        "confirmacao",
        function() {
            listaDeProdutos.splice(index, 1);

            if (indiceEdicao === index) {
                cancelarEdicao();

            } else if (
                indiceEdicao !== null &&
                indiceEdicao > index
            ) {
                indiceEdicao--;
            }

            salvarProdutos();
            renderizarTabela();

            mostrarMensagem(
                "Produto removido com sucesso!",
                "sucesso"
            );
        }
    );
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

    valorTotal.textContent = formatarMoeda(total);
}


// RENDERIZAR TABELA
function renderizarTabela() {
    tabelaProdutos.innerHTML = "";

    const produtosVisiveis = obterProdutosFiltrados();

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

        produtosVisiveis.forEach(item => {
            const produto = item.produto;
            const index = item.index;

            const linha = document.createElement("tr");

            const valores = [
                produto.nome,
                formatarMoeda(produto.preco),
                produto.quantidade,
                formatarMoeda(
                    Number(produto.preco) *
                    Number(produto.quantidade)
                )
            ];

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

    atualizarValorTotal(produtosVisiveis);
}


// BUSCA EM TEMPO REAL NA TABELA
campoBusca.addEventListener("input", function() {
    renderizarTabela();
});


// LIMPAR TODO O ESTOQUE
btnLimpar.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        mostrarMensagem(
            "O estoque já está vazio.",
            "aviso"
        );

        return;
    }

    abrirModal(
        "Limpar todo o estoque",
        "Tem certeza de que deseja excluir todos os produtos cadastrados? Essa ação não poderá ser desfeita.",
        "confirmacao",
        function() {
            listaDeProdutos = [];

            cancelarEdicao();

            campoBusca.value = "";

            salvarProdutos();
            renderizarTabela();

            mostrarMensagem(
                "Todo o estoque foi limpo com sucesso!",
                "sucesso"
            );
        }
    );
});


// MODAL EXPLICANDO O CONCEITO BOOTSTRAP
btnBootstrap.addEventListener("click", function() {
    abrirModal(
        "Conceito Bootstrap",
        "O Bootstrap é uma biblioteca CSS que oferece componentes prontos, como botões, formulários, tabelas e janelas modais. No projeto Nova Texas, poderíamos utilizá-lo para acelerar a criação da interface, padronizar os elementos visuais e facilitar a adaptação do sistema para diferentes tamanhos de tela. Nesta versão, desenvolvemos os estilos e os modais com CSS e JavaScript próprios, aplicando conceitos semelhantes de organização e experiência do usuário.",
        "conceito",
        null
    );
});


// INICIAR SISTEMA
carregarProdutos();