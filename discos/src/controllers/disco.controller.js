const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    const data = req.body;

    const item = await prisma.disco.create({
        data
    });

    res.json(item).status(201).end();
};

const listar = async (req, res) => {
    const lista = await prisma.disco.findMany();

    lista.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));

    res.status(200).json(lista);
};


const buscar = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.disco.findUnique({
        where: { id: Number(id) }
    });

    res.json(item).status(200).end();
};

const atualizar = async (req, res) => {
    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.disco.update({
        where: { id: Number(id) },
        data: dados
    });

    res.json(item).status(200).end();
};

const excluir = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.disco.delete({
        where: { id: Number(id) }
    });

    res.json(item).status(200).end();
};

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
}
