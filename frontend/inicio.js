
const nomeUsuario = document.getElementById("nomeUsuario");
const botaoSair = document.getElementById("botaoSair");

const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario"));

if (usuarioLogado) {
    nomeUsuario.textContent = usuarioLogado.nome;
} else {
    nomeUsuario.textContent = "Usuário";
}

botaoSair.addEventListener("click", function() {
    sessionStorage.removeItem("usuario");
    window.location.href = "login.html";
});
