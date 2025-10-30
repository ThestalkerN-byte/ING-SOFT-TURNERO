document.addEventListener("DOMContentLoaded", function() {
    
    // --- MANEJO DE NAVEGACIÓN ---
    const cerrarSesion = document.getElementById("cerrar-sesion");
    if (cerrarSesion) {
        cerrarSesion.addEventListener("click", function(e) {
            e.preventDefault();
            window.location.href = "index.html"; 
        });
    }

    // --- REDIRECCIÓN AL FORMULARIO DE NUEVO PACIENTE ---
    const btnNuevo = document.getElementById("btn-nuevo-paciente");
    if (btnNuevo) {
        btnNuevo.addEventListener("click", function() {
            localStorage.removeItem("pacienteEditar"); // Limpia edición anterior
            window.location.href = "paciente-form.html";
        });
    }

    // --- FUNCIONALIDAD DEL BUSCADOR ---
    const searchInput = document.getElementById("paciente-search");
    if (searchInput) {
        searchInput.addEventListener("keyup", function() {
            const filtro = searchInput.value.toLowerCase();
            const tablaBody = document.getElementById("pacientes-tbody");
            const filas = tablaBody.getElementsByTagName("tr");

            for (let i = 0; i < filas.length; i++) {
                const fila = filas[i];
                const celdaNombre = fila.cells[0];
                const celdaApellido = fila.cells[1];
                const celdaDNI = fila.cells[2];

                if (celdaNombre && celdaApellido && celdaDNI) {
                    const textoNombre = celdaNombre.textContent.toLowerCase();
                    const textoApellido = celdaApellido.textContent.toLowerCase();
                    const textoDNI = celdaDNI.textContent.toLowerCase();

                    if (
                        textoNombre.includes(filtro) ||
                        textoApellido.includes(filtro) ||
                        textoDNI.includes(filtro)
                    ) {
                        fila.style.display = "";
                    } else {
                        fila.style.display = "none";
                    }
                }
            }
        });
    }

    // --- CARGAR PACIENTES GUARDADOS ---
    const tablaBody = document.getElementById("pacientes-tbody");
    if (tablaBody) {
        const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

        pacientes.forEach((p, index) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${p.name}</td>
                <td>${p.surname}</td>
                <td>${p.dni}</td>
                <td>${p.phone}</td>
                <td>${p.obraSocial}</td>
                <td>
                    <button class="btn-editar" data-index="${index}">Editar</button>
                    <button class="btn-eliminar" data-index="${index}">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });

        // --- ACCIONES DE EDITAR Y ELIMINAR ---
        tablaBody.addEventListener("click", (e) => {
            const target = e.target;

            // ELIMINAR PACIENTE
            if (target.classList.contains("btn-eliminar")) {
                const index = target.getAttribute("data-index");
                const confirmar = confirm("¿Seguro que quieres eliminar este paciente?");
                if (confirmar) {
                    pacientes.splice(index, 1);
                    localStorage.setItem("pacientes", JSON.stringify(pacientes));
                    location.reload();
                }
            }

            // EDITAR PACIENTE
            if (target.classList.contains("btn-editar")) {
                const index = target.getAttribute("data-index");
                const pacienteEditar = pacientes[index];
                localStorage.setItem("pacienteEditar", JSON.stringify({ index, pacienteEditar }));
                window.location.href = "paciente-form.html";
            }
        });
    }
});
