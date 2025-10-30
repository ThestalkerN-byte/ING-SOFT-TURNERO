document.addEventListener("DOMContentLoaded", function () {

    // --- CERRAR SESIÓN ---
    const cerrarSesion = document.getElementById("cerrar-sesion");
    if (cerrarSesion) {
        cerrarSesion.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "index.html";
        });
    }

    // --- BOTÓN CANCELAR ---
    document.getElementById("cancelar").addEventListener("click", function () {
        window.location.href = "pacientes.html";
    });

    // --- GUARDAR PACIENTE ---
    const form = document.getElementById("form-paciente");
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // 1. Tomar valores del formulario
        const paciente = {
            name: document.getElementById("name").value,
            surname: document.getElementById("surname").value,
            age: document.getElementById("age").value,
            dni: document.getElementById("dni").value,
            phone: document.getElementById("phone").value,
            obraSocial: document.getElementById("obraSocial").value
        };

        // 2. Obtener la lista actual de pacientes
        let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

        // 3. Agregar el nuevo paciente
        pacientes.push(paciente);

        // 4. Guardar la lista actualizada
        localStorage.setItem("pacientes", JSON.stringify(pacientes));

        // 5. Volver a la página principal de pacientes
        alert("Paciente registrado correctamente ✅");
        window.location.href = "pacientes.html";
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-paciente");

    // Si venís a editar
    const editarData = JSON.parse(localStorage.getItem("pacienteEditar"));
    if (editarData) {
        const { pacienteEditar } = editarData;
        document.getElementById("name").value = pacienteEditar.name;
        document.getElementById("surname").value = pacienteEditar.surname;
        document.getElementById("age").value = pacienteEditar.age;
        document.getElementById("dni").value = pacienteEditar.dni;
        document.getElementById("phone").value = pacienteEditar.phone;
        document.getElementById("obraSocial").value = pacienteEditar.obraSocial;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nuevoPaciente = {
            name: document.getElementById("name").value,
            surname: document.getElementById("surname").value,
            age: document.getElementById("age").value,
            dni: document.getElementById("dni").value,
            phone: document.getElementById("phone").value,
            obraSocial: document.getElementById("obraSocial").value
        };

        let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

        // Si es edición
        if (editarData) {
            pacientes[editarData.index] = nuevoPaciente;
            localStorage.removeItem("pacienteEditar");
        } else {
            pacientes.push(nuevoPaciente);
        }

        localStorage.setItem("pacientes", JSON.stringify(pacientes));
        alert("Paciente guardado correctamente");
        window.location.href = "pacientes.html";
    });
});