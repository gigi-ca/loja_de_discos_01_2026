
const formularioLogin = document.getElementById("formularioLogin");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const mensagemErro = document.getElementById("mensagemErro");
const botaoEntrar = document.querySelector(".botao-entrar");
const mostrarSenha = document.getElementById("mostrarSenha");

formularioLogin.addEventListener("submit", async evento => {
    evento.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    mensagemErro.textContent = "";

    if (!email || !senha) {
        mostrarErro("Preencha o e-mail e a senha.");
        return;
    }

    botaoEntrar.disabled = true;

    try {
        const resposta = await fetch("http://localhost:3000/usuario/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarErro(dados.erro || "E-mail ou senha incorretos.");
            return;
        }

        sessionStorage.setItem("usuario", JSON.stringify(dados.usuario));
        console.log("Redirecionando para inicio.html");
window.location.replace("./inicio.html");

    } catch (erro) {
        mostrarErro("Não foi possível conectar ao servidor.");
        console.error(erro);
    } finally {
        botaoEntrar.disabled = false;
    }
});

function mostrarErro(texto) {
    mensagemErro.textContent = texto;
}

mostrarSenha.addEventListener("click", () => {
    campoSenha.type = campoSenha.type === "password" ? "text" : "password";
    mostrarSenha.setAttribute(
        "aria-label",
        campoSenha.type === "password" ? "Mostrar senha" : "Ocultar senha"
    );
});
