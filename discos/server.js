require('dotenv').config();
const express = require('express');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const movimentacaoRoutes = require('./src/routes/movimentacao.routes');

app.use('/movimentacao', movimentacaoRoutes);


const discoRoutes = require('./src/routes/disco.routes');

app.use('/disco', discoRoutes);


const usuarioRoutes = require('./src/routes/usuario.routes');

app.use('/usuario', usuarioRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
