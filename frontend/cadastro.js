
const API = "http://localhost:3000/discos";

const formulario = document.getElementById("formularioDisco");
const formularioBusca = document.getElementById("formularioBusca");
const listaDiscos = document.getElementById("listaDiscos");
const mensagem = document.getElementById("mensagem");

const campos = {
    id: document.getElementById("idDisco"),
    titulo: document.getElementById("titulo"),
    artista: document.getElementById("artista"),
    ano: document.getElementById("ano"),
    genero: document.getElementById("genero"),
    gravadora: document.getElementById("gravadora"),
    quantidade: document.getElementById("quantidade"),
    preco: document.getElementById("preco"),
    estado: document.getElementById("estado")
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

async function carregarDiscos(termo = "") {
    listaDiscos.innerHTML = `
        <tr>
            <td colspan="8" class="mensagem-tabela">
                Carregando discos...
            </td>
        </tr>
    `;

    try {
        const resposta = await fetch(
            `${API}?busca=${encodeURIComponent(termo)}`
        );
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os discos.");
        }
        const dados = await resposta.json();
        discos = Array.isArray(dados) ? dados : dados.discos;
        if (!Array.isArray(discos)) {
            throw new Error("A resposta da API não contém uma lista de discos.");
        }
        mostrarDiscos(discos);
    } catch (erro) {
        listaDiscos.innerHTML = `
            <tr>
                <td colspan="8" class="mensagem-tabela">
                    Não foi possível carregar os discos.
                </td>
            </tr>
        `;

        document.getElementById("totalDiscos").textContent = "— discos";
        console.error(erro);
    }
}

function mostrarDiscos(lista) {
    listaDiscos.innerHTML = "";
    document.getElementById("totalDiscos").textContent =
        `${lista.length} ${lista.length === 1 ? "disco" : "discos"}`;
    if (lista.length === 0) {
        listaDiscos.innerHTML = `
            <tr>
                <td colspan="8" class="mensagem-tabela">
                    Nenhum disco encontrado.
                </td>
            </tr>
        `;
        return;
    }

    lista.forEach(disco => {
        const linha = document.createElement("tr");

        const valores = [
            disco.titulo,
            disco.artista,
            disco.ano,
            disco.genero,
            disco.quantidade,
            formatarPreco(disco.preco),
            disco.estado
        ];

        valores.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor ?? "—";
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
    const ano = Number(campos.ano.value);
    const quantidade = Number(campos.quantidade.value);
    const preco = Number(campos.preco.value);

    if (!titulo || !artista || !campos.ano.value ||
        !campos.genero.value || !campos.estado.value ||
        campos.quantidade.value === "" || campos.preco.value === "") {
        alert("Preencha todos os campos obrigatórios.");
        return false;
    }

    if (!Number.isInteger(ano) || ano < 1900 || ano > 2100) {
        alert("Informe um ano válido entre 1900 e 2100.");
        campos.ano.focus();
        return false;
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
        alert("A quantidade deve ser um número inteiro igual ou maior que zero.");
        campos.quantidade.focus();
        return false;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
        alert("Informe um preço maior que zero.");
        campos.preco.focus();
        return false;
    }

    return true;
}

function obterDadosFormulario() {
    return {
        titulo: campos.titulo.value.trim(),
        artista: campos.artista.value.trim(),
        ano: Number(campos.ano.value),
        genero: campos.genero.value,
        gravadora: campos.gravadora.value.trim(),
        quantidade: Number(campos.quantidade.value),
        preco: Number(campos.preco.value),
        estado: campos.estado.value
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
        ? `${API}/${encodeURIComponent(id)}`
        : API;

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
        formulario.reset();
        campos.id.value = "";
        document.getElementById("tituloFormulario").textContent =
            "Adicionar novo disco";
        document.getElementById("botaoSalvar").textContent =
            "+ Cadastrar disco";
        document.getElementById("botaoCancelar").hidden = true;

        await carregarDiscos(termoAtual);
    } catch (erro) {
        mostrarMensagem(
            "Não foi possível salvar. Verifique a conexão com o backend.",
            "erro"
        );
        console.error(erro);
    }
});

function editarDisco(disco) {
    campos.id.value = disco.id;
    campos.titulo.value = disco.titulo ?? "";
    campos.artista.value = disco.artista ?? "";
    campos.ano.value = disco.ano ?? "";
    campos.genero.value = disco.genero ?? "";
    campos.gravadora.value = disco.gravadora ?? "";
    campos.quantidade.value = disco.quantidade ?? "";
    campos.preco.value = disco.preco ?? "";
    campos.estado.value = disco.estado ?? "";

    document.getElementById("tituloFormulario").textContent = "Editar disco";
    document.getElementById("botaoSalvar").textContent = "Salvar alterações";
    document.getElementById("botaoCancelar").hidden = false;

    formulario.scrollIntoView({ behavior: "smooth" });
    campos.titulo.focus();
}

document.getElementById("botaoCancelar").addEventListener("click", () => {
    formulario.reset();
    campos.id.value = "";
    document.getElementById("tituloFormulario").textContent =
        "Adicionar novo disco";
    document.getElementById("botaoSalvar").textContent =
        "+ Cadastrar disco";
    document.getElementById("botaoCancelar").hidden = true;
    mostrarMensagem("", "");
});

async function excluirDisco(id) {
    if (!confirm("Tem certeza de que deseja excluir este disco?")) {
        return;
    }
    try {
        const resposta = await fetch(
            `${API}/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível excluir o disco.");
        }

        mostrarMensagem("Disco excluído com sucesso!", "sucesso");
        await carregarDiscos(termoAtual);
    } catch (erro) {
        mostrarMensagem(
            "Não foi possível excluir. Verifique a conexão com o backend.",
            "erro"
        );
        console.error(erro);
    }
}

formularioBusca.addEventListener("submit", evento => {
    evento.preventDefault();
    termoAtual = document.getElementById("termoBusca").value.trim();
    carregarDiscos(termoAtual);
});

document.getElementById("botaoLimpar").addEventListener("click", () => {
    document.getElementById("termoBusca").value = "";
    termoAtual = "";
    carregarDiscos();
});

carregarDiscos();