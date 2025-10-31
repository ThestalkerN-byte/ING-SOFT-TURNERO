document.addEventListener("DOMContentLoaded", function() {
    
    // --- MANEJO DE NAVEGACIÓN ---
    const cerrarSesion = document.getElementById("cerrar-sesion");
    if (cerrarSesion) {
        cerrarSesion.addEventListener("click", function(e) {
            e.preventDefault();
            window.location.href = "index.html"; 
        });
    }

    // --- VARIABLES GLOBALES Y SELECTORES ---
    let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
    let editIndex = null;
    let deleteIndex = null; // Guardará el índice del paciente a borrar

    const tablaBody = document.getElementById("pacientes-tbody");
    const searchInput = document.getElementById("paciente-search");
    const btnNuevo = document.getElementById("btn-nuevo-paciente");

    // --- Selectores del Modal Formulario ---
    const modalForm = document.getElementById("modal-paciente");
    const modalTitle = document.getElementById("modal-title");
    const form = document.getElementById("form-paciente");
    const closeFormBtn = document.getElementById("modal-paciente-close");
    const cancelFormBtn = document.getElementById("btn-cancelar-form");

    // --- Selectores del Modal de Borrado ---
    const modalDelete = document.getElementById("modal-delete-paciente");
    const deleteInfo = document.getElementById("delete-paciente-info");
    const btnConfirmarDelete = document.getElementById("btn-confirmar-delete");
    const btnCancelarDelete = document.getElementById("btn-cancelar-delete");
    const closeDeleteBtn = document.getElementById("modal-delete-close");
    
    // --- Selectores del Modal de Éxito ---
    const modalSuccess = document.getElementById("modal-success-paciente");
    const btnSuccessOk = document.getElementById("btn-success-ok");
    const closeSuccessBtn = document.getElementById("modal-success-close");


    // --- RENDERIZAR LA TABLA DE PACIENTES ---
    function renderPacientes() {
        if (!tablaBody) return;
        tablaBody.innerHTML = "";
        pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

        pacientes.forEach((p, index) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${p.name}</td>
                <td>${p.surname}</td>
                <td>${p.age}</td>
                <td>${p.dni}</td>
                <td>${p.phone}</td>
                <td>${p.obraSocial}</td>
                <td class="acciones-col">
                    <button class="action-btn edit-btn" data-index="${index}">Editar</button>
                    <button class="action-btn delete-btn" data-index="${index}">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });
    }

    // --- FUNCIONALIDAD DEL BUSCADOR ---
    if (searchInput) {
        searchInput.addEventListener("keyup", function() {
            const filtro = searchInput.value.toLowerCase();
            const filas = tablaBody.getElementsByTagName("tr");
            for (let i = 0; i < filas.length; i++) {
                const fila = filas[i];
                const celdas = fila.cells;
                const texto = (celdas[0].textContent + celdas[1].textContent + celdas[2].textContent).toLowerCase();
                fila.style.display = texto.includes(filtro) ? "" : "none";
            }
        });
    }

    // --- ACCIONES DE LA TABLA (EDITAR Y ELIMINAR) ---
    if (tablaBody) {
        tablaBody.addEventListener("click", (e) => {
            const target = e.target;

            // --- ELIMINAR PACIENTE (ABRIR MODAL DE CONFIRMACIÓN) ---
            if (target.classList.contains("delete-btn")) {
                deleteIndex = target.getAttribute("data-index"); // Guarda el índice
                const paciente = pacientes[deleteIndex];
                deleteInfo.textContent = `${paciente.name} ${paciente.surname} (DNI: ${paciente.dni})`;
                modalDelete.style.display = "block"; // Muestra el modal de borrado
            }

            // --- EDITAR PACIENTE (ABRIR MODAL DE FORMULARIO) ---
            if (target.classList.contains("edit-btn")) {
                editIndex = target.getAttribute("data-index");
                const paciente = pacientes[editIndex];
                
                document.getElementById("name").value = paciente.name;
                document.getElementById("surname").value = paciente.surname;
                document.getElementById("age").value = paciente.age;
                document.getElementById("dni").value = paciente.dni;
                document.getElementById("phone").value = paciente.phone;
                document.getElementById("obraSocial").value = paciente.obraSocial;
                
                modalTitle.textContent = "Editar Paciente";
                modalForm.style.display = "block";
            }
        });
    }
    
    // --- LÓGICA DEL MODAL DE BORRADO ---
    // Clic en "Confirmar"
    btnConfirmarDelete.addEventListener("click", function() {
        pacientes.splice(deleteIndex, 1);
        localStorage.setItem("pacientes", JSON.stringify(pacientes));
        location.reload(); // Recarga la página
    });
    // Clic en "Cancelar" o "X"
    btnCancelarDelete.addEventListener("click", () => modalDelete.style.display = "none");
    closeDeleteBtn.addEventListener("click", () => modalDelete.style.display = "none");


    // --- ABRIR MODAL PARA NUEVO PACIENTE ---
    if (btnNuevo) {
        btnNuevo.addEventListener("click", function() {
            editIndex = null;
            form.reset();
            modalTitle.textContent = "Registrar Paciente";
            modalForm.style.display = "block";
        });
    }

    // --- CERRAR MODAL DE FORMULARIO ---
    function closeFormModal() {
        modalForm.style.display = "none";
    }
    closeFormBtn.addEventListener("click", closeFormModal);
    cancelFormBtn.addEventListener("click", closeFormModal);

    // --- LÓGICA DE GUARDAR (FORMULARIO) ---
    if (form) {
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

            if (editIndex !== null) {
                pacientes[editIndex] = nuevoPaciente;
            } else {
                pacientes.push(nuevoPaciente);
            }

            localStorage.setItem("pacientes", JSON.stringify(pacientes));
            
            closeFormModal(); // Cierra el formulario
            modalSuccess.style.display = "block"; // Muestra el modal de éxito
        });
    }

    // --- LÓGICA DEL MODAL DE ÉXITO ---
    // Clic en "Aceptar" o "X"
    function closeSuccessModal() {
        modalSuccess.style.display = "none";
        location.reload(); // Recarga la página DESPUÉS de cerrar el modal
    }
    btnSuccessOk.addEventListener("click", closeSuccessModal);
    closeSuccessBtn.addEventListener("click", closeSuccessModal);
    
    // --- CERRAR MODALES AL HACER CLIC FUERA ---
    window.addEventListener("click", function(e) {
        if (e.target == modalForm) closeFormModal();
        if (e.target == modalDelete) modalDelete.style.display = "none";
        if (e.target == modalSuccess) closeSuccessModal();
    });

    // --- INICIALIZAR ---
    renderPacientes();
});