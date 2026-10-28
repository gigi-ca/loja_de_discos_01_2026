
const API_DISCOS = "http://localhost:3000/disco/listar";
const API_MOVIMENTACOES = "http://localhost:3000/movimentacao/cadastrar";

const formulario = document.getElementById("formularioMovimentacao");
const campoDisco = document.getElementById("disco");
const campoTipo = document.getElementById("tipo");
const campoQuantidade = document.getElementById("quantidade");
const campoData = document.getElementById("data");
const listaDiscos = document.getElementById("listaDiscos");
const mensagem = document.getElementById("mensagem");
const resumoEstoque = document.getElementById("resumoEstoque");
const campoBusca = document.getElementById("busca");
const usuario = JSON.parse(sessionStorage.getItem("usuario"));

let discos = [];

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function ordenarDiscos(lista) {
    return [...lista].sort((a, b) =>
        a.titulo.localeCompare(b.titulo, "pt-BR")
    );
}

function obterEstoque(disco) {
    return Number(disco.quantidade);
}

function obterEstoqueMinimo(disco) {
    return Number(disco.estoqueMinimo);
}

async function carregarDiscos() {
    try {
        const resposta = await fetch(API_DISCOS);

        if (!resposta.ok) {
            throw new Error("Falha ao buscar os discos.");
        }

        const dados = await resposta.json();

        discos = ordenarDiscos(dados);

        preencherSelecao();
        mostrarDiscos();

    } catch (erro) {
        listaDiscos.innerHTML = `
            <tr>
                <td colspan="5" class="mensagem-tabela">
                    Não foi possível carregar o acervo. Verifique o backend.
                </td>
            </tr>
        `;

        campoDisco.innerHTML = '<option value="">Falha ao carregar discos</option>';
        console.error(erro);
    }
}

function preencherSelecao() {
    campoDisco.innerHTML = '<option value="">Selecione um disco</option>';

    discos.forEach(disco => {
        const opcao = document.createElement("option");
        opcao.value = disco.id;
        opcao.textContent = disco.titulo;
        campoDisco.appendChild(opcao);
    });
}

function mostrarDiscos() {
    const termo = campoBusca.value.trim().toLocaleLowerCase("pt-BR");

    const filtrados = discos.filter(disco => {
        const titulo = disco.titulo.toLocaleLowerCase("pt-BR");
        const artista = disco.artista.toLocaleLowerCase("pt-BR");

        return titulo.includes(termo) || artista.includes(termo);
    });

    listaDiscos.innerHTML = "";

    document.getElementById("totalDiscos").textContent =
        `${filtrados.length} ${filtrados.length === 1 ? "disco" : "discos"}`;

    if (filtrados.length === 0) {
        listaDiscos.innerHTML = `
            <tr>
                <td colspan="5" class="mensagem-tabela">
                    Nenhum disco encontrado.
                </td>
            </tr>
        `;
        return;
    }

    filtrados.forEach(disco => {
        const estoque = obterEstoque(disco);
        const minimo = obterEstoqueMinimo(disco);
        const linha = document.createElement("tr");

        const valores = [
            disco.titulo,
            disco.artista,
            estoque,
            minimo
        ];

        valores.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaSituacao = document.createElement("td");
        const etiqueta = document.createElement("span");

        etiqueta.className = estoque < minimo
            ? "situacao baixo"
            : "situacao ok";

        etiqueta.textContent = estoque < minimo
            ? "Estoque abaixo do mínimo"
            : "Estoque adequado";

        celulaSituacao.appendChild(etiqueta);
        linha.appendChild(celulaSituacao);

        listaDiscos.appendChild(linha);
    });
}

function atualizarResumo() {
    const disco = discos.find(item => String(item.id) === campoDisco.value);

    if (!disco) {
        resumoEstoque.textContent =
            "Selecione um disco para consultar o estoque atual.";
        return;
    }

    const estoque = obterEstoque(disco);
    const minimo = obterEstoqueMinimo(disco);

    resumoEstoque.textContent =
        `Estoque atual: ${estoque} disco(s). Estoque mínimo: ${minimo} disco(s).`;
}

campoDisco.addEventListener("change", atualizarResumo);
campoBusca.addEventListener("input", mostrarDiscos);

campoTipo.addEventListener("change", () => {
    if (campoTipo.value === "VENDA") {
        const disco = discos.find(item => String(item.id) === campoDisco.value);

        if (disco) {
            campoQuantidade.max = disco.quantidade;
        }
    } else {
        campoQuantidade.removeAttribute("max");
    }
});

campoDisco.addEventListener("change", () => {
    if (campoTipo.value === "VENDA") {
        const disco = discos.find(item => String(item.id) === campoDisco.value);

        if (disco) {
            campoQuantidade.max = disco.quantidade;
        }
    }
});

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const disco = discos.find(item => String(item.id) === campoDisco.value);
    const tipo = campoTipo.value;
    const quantidade = Number(campoQuantidade.value);
    const data = campoData.value;

    if (!disco || !tipo || !data || campoQuantidade.value === "") {
        mostrarMensagem("Preencha todos os campos da movimentação.", "erro");
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        mostrarMensagem("A quantidade deve ser um número inteiro maior que zero.", "erro");
        return;
    }

    if (tipo === "VENDA" && quantidade > obterEstoque(disco)) {
        mostrarMensagem("Não há discos suficientes no estoque para essa venda.", "erro");
        return;
    }

    if (!usuario) {
        mostrarMensagem("Faça login para registrar movimentações.", "erro");
        return;
    }

    const dados = {
        discoId: disco.id,
        usuarioId: usuario.id,
        tipo,
        quantidade,
        data: `${data}T12:00:00`
    };

    try {
        const resposta = await fetch(API_MOVIMENTACOES, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Não foi possível registrar a movimentação.");
        }

        mostrarMensagem("Movimentação registrada com sucesso!", "sucesso");

        await carregarDiscos();

        const discoAtualizado = discos.find(item => item.id === disco.id);

        if (tipo === "VENDA" && discoAtualizado) {
            const estoqueFinal = obterEstoque(discoAtualizado);
            const minimoFinal = obterEstoqueMinimo(discoAtualizado);

            if (estoqueFinal < minimoFinal) {
                alert(
                    `Atenção! O estoque de "${disco.titulo}" está abaixo do mínimo configurado.\n` +
                    `Estoque atual: ${estoqueFinal}.\n` +
                    `Estoque mínimo: ${minimoFinal}.`
                );
            }
        }

        formulario.reset();
        campoData.value = new Date().toLocaleDateString("en-CA");
        atualizarResumo();

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
        console.error(erro);
    }
});

campoData.value = new Date().toLocaleDateString("en-CA");

carregarDiscos();
