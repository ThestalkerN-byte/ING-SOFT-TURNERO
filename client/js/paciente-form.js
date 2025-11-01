document.addEventListener("DOMContentLoaded", function () {
    
    // API base URL  
    const API_BASE_URL = "https://ing-soft-turnero.onrender.com/api";
    
    // Selectores del formulario
    const form = document.getElementById("paciente-form") || document.getElementById("form-paciente");
    const btnCancelar = document.getElementById("cancelar") || document.getElementById("btn-cancelar");
    
    if (!form) {
        console.error("No se encontró el formulario");
        return;
    }

    // Cerrar sesión
    const cerrarSesion = document.getElementById("cerrar-sesion");
    if (cerrarSesion) {
        cerrarSesion.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "../html/index.html";
        });
    }

    // Botón cancelar
    if (btnCancelar) {
        btnCancelar.addEventListener("click", function () {
            window.location.href = "../html/pacientes.html";
        });
    }

    // Cargar datos si es edición
    const editarData = JSON.parse(localStorage.getItem("pacienteEditar") || "null");
    if (editarData && editarData.pacienteEditar) {
        const paciente = editarData.pacienteEditar;
        
        // Mapear los campos según el ID del formulario
        const nameField = document.getElementById("name");
        const surnameField = document.getElementById("surname");
        const ageField = document.getElementById("age");
        const dniField = document.getElementById("dni");
        const phoneField = document.getElementById("phone") || document.getElementById("telefono");
        const obraSocialField = document.getElementById("obraSocial");
        
        if (nameField) nameField.value = paciente.name || "";
        if (surnameField) surnameField.value = paciente.surname || "";
        if (ageField) ageField.value = paciente.age || "";
        if (dniField) dniField.value = paciente.dni || "";
        if (phoneField) phoneField.value = paciente.phone || paciente.telefono || "";
        if (obraSocialField) obraSocialField.value = paciente.obraSocial || paciente.medical_insurance || "";
    }

    // Guardar paciente
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Obtener valores del formulario y validarlos
        const nameField = document.getElementById("name");
        const surnameField = document.getElementById("surname");
        const ageField = document.getElementById("age");
        const dniField = document.getElementById("dni");
        const phoneField = document.getElementById("phone") || document.getElementById("telefono");
        const obraSocialField = document.getElementById("obraSocial");

        const pacienteData = {
            name: nameField ? nameField.value.trim() : "",
            surname: surnameField ? surnameField.value.trim() : "",
            age: ageField ? ageField.value : null,
            dni: dniField ? dniField.value : "",
            phone: phoneField ? phoneField.value.trim() : null,
            medical_insurance: obraSocialField ? obraSocialField.value.trim() : ""
        };

        // Validar campos requeridos
        if (!pacienteData.name || !pacienteData.surname || !pacienteData.dni || !pacienteData.medical_insurance) {
            mostrarError("Por favor complete todos los campos requeridos: Nombre, Apellido, DNI y Obra Social");
            return;
        }

        if (isNaN(pacienteData.dni) || pacienteData.dni.length === 0) {
            mostrarError("El DNI debe ser un número válido");
            return;
        }

        try {
            const dniNumber = parseInt(pacienteData.dni);

            // Verificar si el paciente ya existe (tiene turnos)
            const responseCheck = await fetch(`${API_BASE_URL}/pacientes/${dniNumber}`);
            const resultCheck = await responseCheck.json();
            
            const pacienteExiste = resultCheck.success && resultCheck.data;

            if (pacienteExiste || editarData) {
                // Si el paciente existe, actualizar su información en todos sus turnos
                const response = await fetch(`${API_BASE_URL}/pacientes/${dniNumber}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: pacienteData.name,
                        surname: pacienteData.surname,
                        phone: pacienteData.phone,
                        medical_insurance: pacienteData.medical_insurance
                    })
                });

                const result = await response.json();

                if (result.success) {
                    mostrarExito("Paciente actualizado correctamente");
                    localStorage.removeItem("pacienteEditar");
                    
                    // Esperar un momento antes de redirigir
                    setTimeout(() => {
                        window.location.href = "../html/pacientes.html";
                    }, 1500);
                } else {
                    mostrarError(result.error || "Error al actualizar el paciente");
                }
            } else {
                // Si el paciente no existe, guardar temporalmente en localStorage
                // hasta que se cree un turno para él
                let pacientesTemporales = JSON.parse(localStorage.getItem("pacientesTemporales") || "[]");
                
                // Verificar si ya existe un paciente temporal con ese DNI
                const indexExistente = pacientesTemporales.findIndex(p => p.dni === dniNumber);
                
                const pacienteTemp = {
                    dni: dniNumber,
                    name: pacienteData.name,
                    surname: pacienteData.surname,
                    age: pacienteData.age,
                    phone: pacienteData.phone,
                    medical_insurance: pacienteData.medical_insurance,
                    created_at: new Date().toISOString()
                };

                if (indexExistente >= 0) {
                    pacientesTemporales[indexExistente] = pacienteTemp;
                } else {
                    pacientesTemporales.push(pacienteTemp);
                }

                localStorage.setItem("pacientesTemporales", JSON.stringify(pacientesTemporales));
                
                mostrarExito("Paciente guardado. Esta información se usará cuando se cree un turno para este paciente.");
                localStorage.removeItem("pacienteEditar");
                
                setTimeout(() => {
                    window.location.href = "../html/pacientes.html";
                }, 2000);
            }
        } catch (error) {
            console.error("Error al guardar paciente:", error);
            mostrarError("Error de conexión. Verifica que el servidor esté corriendo.");
        }
    });

    /**
     * Muestra un mensaje de error
     */
    function mostrarError(mensaje) {
        alert("❌ Error: " + mensaje);
    }

    /**
     * Muestra un mensaje de éxito
     */
    function mostrarExito(mensaje) {
        alert("✅ " + mensaje);
    }
});
