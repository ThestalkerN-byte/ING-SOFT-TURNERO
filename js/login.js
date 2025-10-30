// 1. Esperamos a que todo el HTML esté cargado
// Esperamos a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", function() {
    
    // Seleccionamos los elementos del HTML
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("error-message");

    // Escuchamos el evento "submit"
    loginForm.addEventListener("submit", function(evento) {
        
        evento.preventDefault(); // Prevenimos que la página se recargue

        // Obtenemos los valores
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Comparamos los datos
        
        if (username === "secretaria" && password === "sec123") {
            // Éxito para la secretaria
            errorMessage.textContent = "";
            window.location.href = "agenda.html"; // Va a la agenda

        } else if (username === "doctor" && password === "doc456") {
            // Éxito para el doctor
            errorMessage.textContent = ""; 
            
            // ¡¡AQUÍ ESTÁ EL CAMBIO!!
            // Ahora el doctor también va a la agenda.
            window.location.href = "agenda.html"; 

        } else {
            // Si falla, mostramos un mensaje de error
            errorMessage.textContent = "Usuario o contraseña incorrectos.";
        }
    });
});
