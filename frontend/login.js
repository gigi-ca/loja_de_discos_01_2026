const formularioLogin = document.getElementById("formularioLogin");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const mensagemErro = document.getElementById("mensagemErro");
const botaoEntrar = formularioLogin.querySelector("button");

formularioLogin.addEventListener("submit", function(evento) {
    evento.preventDefault();
    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    mensagemErro.textContent = "";

    if (!email || !senha) {
        mostrarErro("Você precisa preencher o e-mail e a senha.");
        return;
    }

    // A autenticação será conectada ao back-end depois.
    mostrarErro("Email ou senha incorretos!");
});

function mostrarErro(motivo) {
    mensagemErro.textContent = motivo;
    botaoEntrar.disabled = true;
    setTimeout(function() {
        formularioLogin.reset();
        mensagemErro.textContent = "";
        botaoEntrar.disabled = false;
        campoEmail.focus();
    }, 3000);
}