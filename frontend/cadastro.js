
const API = "http://localhost:3000/disco";

const formulario = document.getElementById("formularioDisco");
const formularioBusca = document.getElementById("formularioBusca");
const listaDiscos = document.getElementById("listaDiscos");
const mensagem = document.getElementById("mensagem");

const campos = {
    id: document.getElementById("idDisco"),
    titulo: document.getElementById("titulo"),
    artista: document.getElementById("artista"),
    quantidade: document.getElementById("quantidade"),
    preco: document.getElementById("preco"),
    estoqueMinimo: document.getElementById("estoqueMinimo")
};

let discos = [];
let termoAtual = "";

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

async function carregarDiscos() {
    listaDiscos.innerHTML = `
        <tr>
            <td colspan="6" class="mensagem-tabela">
                Carregando discos...
            </td>
        </tr>
    `;

    try {
        const resposta = await fetch(`${API}/listar`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os discos.");
        }

        const dados = await resposta.json();
        discos = dados.sort((a, b) =>
            a.titulo.localeCompare(b.titulo, "pt-BR")
        );

        mostrarDiscos();

    } catch (erro) {
        listaDiscos.innerHTML = `
            <tr>
                <td colspan="6" class="mensagem-tabela">
                    Não foi possível carregar os discos.
                </td>
            </tr>
        `;

        document.getElementById("totalDiscos").textContent = "— discos";
        console.error(erro);
    }
}

function mostrarDiscos() {
    const termo = termoAtual.toLocaleLowerCase("pt-BR");

    const filtrados = discos.filter(disco =>
        disco.titulo.toLocaleLowerCase("pt-BR").includes(termo) ||
        disco.artista.toLocaleLowerCase("pt-BR").includes(termo)
    );

    listaDiscos.innerHTML = "";

    document.getElementById("totalDiscos").textContent =
        `${filtrados.length} ${filtrados.length === 1 ? "disco" : "discos"}`;

    if (filtrados.length === 0) {
        listaDiscos.innerHTML = `
            <tr>
                <td colspan="6" class="mensagem-tabela">
                    Nenhum disco encontrado.
                </td>
            </tr>
        `;
        return;
    }

    filtrados.forEach(disco => {
        const linha = document.createElement("tr");

        const valores = [
            disco.titulo,
            disco.artista,
            disco.quantidade,
            disco.estoqueMinimo,
            formatarPreco(disco.precoCusto)
        ];

        valores.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaAcoes = document.createElement("td");
        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "botao-editar";
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", () => editarDisco(disco));

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "botao-excluir";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.addEventListener("click", () => excluirDisco(disco.id));

        acoes.append(botaoEditar, botaoExcluir);
        celulaAcoes.appendChild(acoes);
        linha.appendChild(celulaAcoes);

        listaDiscos.appendChild(linha);
    });
}

function validarDisco() {
    const titulo = campos.titulo.value.trim();
    const artista = campos.artista.value.trim();
    const quantidade = Number(campos.quantidade.value);
    const preco = Number(campos.preco.value);
    const estoqueMinimo = Number(campos.estoqueMinimo.value);

    if (!titulo || !artista || campos.quantidade.value === "" ||
        campos.preco.value === "" || campos.estoqueMinimo.value === "") {
        mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
        return false;
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
        mostrarMensagem("A quantidade deve ser um número inteiro igual ou maior que zero.", "erro");
        return false;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
        mostrarMensagem("Informe um preço maior que zero.", "erro");
        return false;
    }

    if (!Number.isInteger(estoqueMinimo) || estoqueMinimo < 0) {
        mostrarMensagem("O estoque mínimo deve ser um número inteiro igual ou maior que zero.", "erro");
        return false;
    }

    return true;
}

function obterDadosFormulario() {
    return {
        titulo: campos.titulo.value.trim(),
        artista: campos.artista.value.trim(),
        precoCusto: Number(campos.preco.value),
        quantidade: Number(campos.quantidade.value),
        estoqueMinimo: Number(campos.estoqueMinimo.value)
    };
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    if (!validarDisco()) {
        return;
    }

    const id = campos.id.value;
    const editando = id !== "";

    const endereco = editando
        ? `${API}/atualizar/${id}`
        : `${API}/cadastrar`;

    try {
        const resposta = await fetch(endereco, {
            method: editando ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obterDadosFormulario())
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível salvar o disco.");
        }

        mostrarMensagem(
            editando
                ? "Disco atualizado com sucesso!"
                : "Disco cadastrado com sucesso!",
            "sucesso"
        );

        cancelarEdicao();
        await carregarDiscos();

    } catch (erro) {
        mostrarMensagem("Não foi possível salvar o disco.", "erro");
        console.error(erro);
    }
});

function editarDisco(disco) {
    campos.id.value = disco.id;
    campos.titulo.value = disco.titulo;
    campos.artista.value = disco.artista;
    campos.quantidade.value = disco.quantidade;
    campos.preco.value = disco.precoCusto;
    campos.estoqueMinimo.value = disco.estoqueMinimo;

    document.getElementById("tituloFormulario").textContent = "Editar disco";
    document.getElementById("botaoSalvar").textContent = "Salvar alterações";
    document.getElementById("botaoCancelar").hidden = false;

    formulario.scrollIntoView({ behavior: "smooth" });
    campos.titulo.focus();
}

function cancelarEdicao() {
    formulario.reset();
    campos.id.value = "";

    document.getElementById("tituloFormulario").textContent =
        "Adicionar novo disco";

    document.getElementById("botaoSalvar").textContent =
        "+ Cadastrar disco";

    document.getElementById("botaoCancelar").hidden = true;
}

document.getElementById("botaoCancelar").addEventListener("click", () => {
    cancelarEdicao();
    mostrarMensagem("", "");
});

async function excluirDisco(id) {
    if (!confirm("Tem certeza de que deseja excluir este disco?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API}/excluir/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível excluir o disco.");
        }

        mostrarMensagem("Disco excluído com sucesso!", "sucesso");
        await carregarDiscos();

    } catch (erro) {
        mostrarMensagem("Não foi possível excluir o disco.", "erro");
        console.error(erro);
    }
}

formularioBusca.addEventListener("submit", evento => {
    evento.preventDefault();
    termoAtual = document.getElementById("termoBusca").value.trim();
    mostrarDiscos();
});

document.getElementById("botaoLimpar").addEventListener("click", () => {
    document.getElementById("termoBusca").value = "";
    termoAtual = "";
    mostrarDiscos();
});

carregarDiscos();
