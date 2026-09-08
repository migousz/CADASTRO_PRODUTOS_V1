//
//FASE 1: modelagem dos dados (Classe Base)
//
//A classe funciona como um molde para criar produtos
class Produto{
    constructor(nome,preco,quantidade){
        //propriedades do objeto recebidas no momento da criação
        this.nome = nome;
        this.preco =parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }
    //método que calcula o subtotal
    calcularSubtotal(){
        return this.preco*this.quantidade;
    }
}

//
//FASE 2: Gerenciamento de Estado (memória)
//
//Array global que guardará todas as instâncias da classe Produto

const listaDeProdutos = [];

//
//FASE 3: Escuta de Eventos do DOM
//
//Selecionamos o formulário pelo ID
const formProduto = document.getElementById("produto-form");

//adicionar um escutador de eventos para quando o formulário for enviado
formProduto.addEventListener("submit",function(event){
    event.preventDefault();

    //1.captura dos valores digitados nos campos de input
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    //2. Criar uma nova instância da classe Produto
    const novoProduto = new Produto(nomeInput,precoInput,quantidadeInput);


    //3.Adiciona o novo produto ao array
    listaDeProdutos.push(novoProduto);

    //4. atualiza a exibição da tabela e limpa o formulário
    renderizarTabela();
    formProduto.reset();
});

//
//FASE 4: Renderização da Interface DOM
//
//função responsável por desenhar na tela o estado
//atual do array listDeProdutos
function renderizarTabela(){
    //seleciona o corpo da tabela (tbody)
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    //limpa o conteúdo anterior da tabela
    tabelaBody.innerHTML = "";

    //percorre o array de produtos usando forEach
    listaDeProdutos.forEach((produto)=>{
        //criar uam linha tr dentro da tabela
        const linha = document.createElement("tr");

        //preenche o conteúdo da linha com os dados do objeto
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        //insere a linha criada dentro do tbody da tabela
        tabelaBody.appendChild(linha);
    })
}