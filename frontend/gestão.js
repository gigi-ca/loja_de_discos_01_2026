
const API_DISCOS = "http://localhost:3000/discos";
const API_MOVIMENTACOES = "http://localhost:3000/movimentacoes";

const formulario = document.getElementById("formularioMovimentacao");
const campoDisco = document.getElementById("disco");
const campoTipo = document.getElementById("tipo");
const campoQuantidade = document.getElementById("quantidade");
const campoData = document.getElementById("data");
const listaDiscos = document.getElementById("listaDiscos");
const mensagem = document.getElementById("mensagem");
const resumoEstoque = document.getElementById("resumoEstoque");
const campoBusca = document.getElementById("busca");

let discos = [];

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function ordenarDiscos(lista) {
    const ordenados = [...lista];

    for (let i = 0; i < ordenados.length - 1; i++) {
        let menor = i;

        for (let j = i + 1; j < ordenados.length; j++) {
            const nomeAtual = String(ordenados[j].nome ?? "");
            const nomeMenor = String(ordenados[menor].nome ?? "");

            if (nomeAtual.localeCompare(nomeMenor, "pt-BR", {
                sensitivity: "base"
            }) < 0) {
                menor = j;
            }
        }
        if (menor !== i) {
            const temporario = ordenados[i];
            ordenados[i] = ordenados[menor];
            ordenados[menor] = temporario;
        }
    }
    return ordenados;
}

function obterEstoque(disco) {
    return Number(disco.estoque ?? 0);
}

function obterEstoqueMinimo(disco) {
    return Number(disco.estoque_minimo ?? disco.estoqueMinimo ?? 0);
}

async function carregarDiscos() {
    try {
        const resposta = await fetch(API_DISCOS);

        if (!resposta.ok) {
            throw new Error("Falha ao buscar os discos.");
        }

        const dados = await resposta.json();
        discos = Array.isArray(dados) ? dados : dados.discos;

        if (!Array.isArray(discos)) {
            throw new Error("A API não retornou uma lista de discos.");
        }

        discos = ordenarDiscos(discos);
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
        opcao.textContent = disco.nome;
        campoDisco.appendChild(opcao);
    });
}

function mostrarDiscos() {
    const termo = campoBusca.value.trim().toLocaleLowerCase("pt-BR");

    const filtrados = discos.filter(disco => {
        const nome = String(disco.nome ?? "").toLocaleLowerCase("pt-BR");
        const descricao = String(disco.descricao ?? "").toLocaleLowerCase("pt-BR");

        return nome.includes(termo) || descricao.includes(termo);
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
            disco.nome,
            disco.artista ?? "—",
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
        `Estoque atual: ${estoque} disco(s). ` +
        `Estoque mínimo: ${minimo} disco(s).`;
}

campoDisco.addEventListener("change", atualizarResumo);
campoBusca.addEventListener("input", mostrarDiscos);

campoTipo.addEventListener("change", () => {
    if (campoTipo.value === "VENDA") {
        campoQuantidade.setAttribute("max", "999999");
    } else {
        campoQuantidade.removeAttribute("max");
    }
});

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const disco = discos.find(item => String(item.id) === campoDisco.value);
    const tipo = campoTipo.value;
    const quantidade = Number(campoQuantidade.value);
    const data = campoData.value;

    if (!disco || !tipo || !data || campoQuantidade.value === "") {
        alert("Preencha todos os campos da movimentação.");
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        alert("A quantidade deve ser um número inteiro maior que zero.");
        return;
    }

    const estoqueAtual = obterEstoque(disco);
    const estoqueMinimo = obterEstoqueMinimo(disco);

    if (tipo === "VENDA" && quantidade > estoqueAtual) {
        alert("Não há discos suficientes no estoque para essa venda.");
        return;
    }

    const novoEstoque = tipo === "VENDA"
        ? estoqueAtual - quantidade
        : estoqueAtual + quantidade;

    const dados = {
        discoId: disco.id,
        tipo,
        quantidade,
        dataMovimentacao: data
    };

    try {
        const resposta = await fetch(API_MOVIMENTACOES, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            throw new Error(erro.mensagem || erro.message ||
                "Não foi possível registrar a movimentação.");
        }

        mostrarMensagem("Movimentação registrada com sucesso!", "sucesso");

        await carregarDiscos();

        const discoAtualizado = discos.find(
            item => String(item.id) === String(disco.id)
        );
        if (tipo === "VENDA" && discoAtualizado) {
            const estoqueFinal = obterEstoque(discoAtualizado);
            const minimoFinal = obterEstoqueMinimo(discoAtualizado);

            if (estoqueFinal < minimoFinal) {
                alert(
                    `Atenção! O estoque de "${disco.nome}" está abaixo do mínimo configurado.\n` +
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