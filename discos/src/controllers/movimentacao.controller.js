
const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    const { discoId, usuarioId, tipo, quantidade, data } = req.body;

    const qtd = Number(quantidade);

    if (!Number.isInteger(qtd) || qtd <= 0) {
        return res.status(400).json({ erro: "Quantidade inválida" });
    }

    if (tipo !== "VENDA" && tipo !== "REPOSICAO") {
        return res.status(400).json({ erro: "Tipo inválido" });
    }

    const disco = await prisma.disco.findUnique({
        where: { id: Number(discoId) }
    });

    if (!disco) {
        return res.status(404).json({ erro: "Disco não encontrado" });
    }

    let estoque = disco.quantidade;

    if (tipo === "REPOSICAO") {
        estoque += qtd;
    } else if (tipo === "VENDA") {
        if (estoque < qtd) {
            return res.status(400).json({ erro: "Estoque insuficiente" });
        }

        estoque -= qtd;
    }

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            const atualizado = await tx.disco.update({
                where: { id: Number(discoId) },
                data: { quantidade: estoque }
            });

            const movimentacao = await tx.movimentacao.create({
                data: {
                    discoId: Number(discoId),
                    usuarioId: Number(usuarioId),
                    tipo,
                    quantidade: qtd,
                    data: data ? new Date(data) : new Date()
                }
            });

            return { atualizado, movimentacao };
        });

        let alerta = null;

        if (tipo === "VENDA" && estoque < disco.estoqueMinimo) {
            alerta = "Estoque abaixo do mínimo!";
        }

        res.status(201).json({ ...resultado, alerta });
    } catch (erro) {
        res.status(400).json({ erro: "Erro ao registrar movimentação. Verifique os dados." });
    }
};

const listar = async (req, res) => {
    const lista = await prisma.movimentacao.findMany();

    res.status(200).json(lista);
};

const buscar = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.movimentacao.findUnique({
        where: { id: Number(id) }
    });

    res.status(200).json(item);
};

const atualizar = async (req, res) => {
    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.movimentacao.update({
        where: { id: Number(id) },
        data: dados
    });

    res.status(200).json(item);
};

const excluir = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.movimentacao.delete({
        where: { id: Number(id) }
    });

    res.status(200).json(item);
};

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
};
