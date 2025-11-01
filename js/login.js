
document.addEventListener("DOMContentLoaded", function () {

    // Selectores del formulario
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("error-message");

    loginForm.addEventListener("submit", function (evento) {

        evento.preventDefault(); // Prevenimos que la página se recargue

        // Obtenemos los valores
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Comparamos los datos

        if (username === "secretaria" && password === "sec123") {
            errorMessage.textContent = "";
            window.location.href = "agenda.html"; // Va a la agenda

        } else if (username === "doctor" && password === "doc456") {
            errorMessage.textContent = "";
            window.location.href = "agenda.html";

        } else {
            errorMessage.textContent = "Usuario o contraseña incorrectos.";
        }
    });
});
