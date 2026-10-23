
const nomeUsuario = document.getElementById("nomeUsuario");
const botaoSair = document.getElementById("botaoSair");

const usuarioLogado = sessionStorage.getItem("nomeUsuario");

if (usuarioLogado) {
    nomeUsuario.textContent = usuarioLogado;
} else {
    nomeUsuario.textContent = "Usuário";
}

botaoSair.addEventListener("click", function() {
    sessionStorage.removeItem("nomeUsuario");
    window.location.href = "login.html";
});
