//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Método que calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória)
//
const listaDeProdutos = [];

// FASE 2.1 Persistência com localStorage
const CHAVE_STORAGE = "sistema_estoque_produtos";

// 1. Função para Salvar os dados no navegador
function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

// 2. Função para Carregar os dados salvos quando a página abre
function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");

//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar Produto pelo Formulário
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    // Captura dos valores digitados nos campos de input
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    // Criar uma nova instância da classe Produto
    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);

    // Adiciona o novo produto ao array
    listaDeProdutos.push(novoProduto);

    // SALVA NO NAVEGADOR
    salvarNoLocalStorage();

    // Atualiza a exibição da tabela, total e limpa o formulário
    atualizarInterface();
    formProduto.reset();
});

// 2. Limpar toda a tabela
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        // Esvazia o array mantendo a mesma referência
        listaDeProdutos.length = 0;

        // SALVA O ESTADO VAZIO NO NAVEGADOR
        salvarNoLocalStorage();

        atualizarInterface();
    }
});

//
// FASE 5: Funções de Atualização e Renderização da Interface
//

// Função responsável por remover um único produto pelo índice
function removerProduto(index) {
    // Remove 1 elemento da lista na posição do índice
    listaDeProdutos.splice(index, 1);

    // Salva a nova lista (sem o item removido) no localStorage
    salvarNoLocalStorage();

    atualizarInterface();
}

// Função responsável por calcular e renderizar o total geral em estoque
function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

// Função responsável por re-desenhar a tabela
function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    // Limpa o conteúdo anterior da tabela
    tabelaBody.innerHTML = "";

    // Percorre o array de produtos
    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        // Adiciona evento ao botão "Remover" da linha atual
        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(index));

        // Insere a linha criada dentro do tbody
        tabelaBody.appendChild(linha);
    });
}

// Função principal que sincroniza a tela com os dados
function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

//
// FASE 6: Inicialização do Sistema
//

// Carrega os dados salvos no localStorage assim que o script executa
carregarDoLocalStorage();

// Desenha a tabela com os produtos recuperados do localStorage
atualizarInterface();