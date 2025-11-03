// Espera a que el contenido se cargue
document.addEventListener("DOMContentLoaded", function() {

    // API base URL    
    const API_BASE_URL = "https://ing-soft-turnero.onrender.com/api";

    // Variables globales
    let currentDate = new Date(); // Guarda la fecha actual
    let turnos = []; // Turnos cargados desde la API
    
    // Modal para agendar un turno
    const agendarModal = document.getElementById("modal-agendar");
    const closeAgendarModalBtn = document.getElementById("close-agendar-modal");
    const cancelAgendarBtn = document.getElementById("btn-cancelar-agendar");
    
    // Modal para eliminar un turno
    const deleteTurnoModal = document.getElementById("modal-delete-turno");
    const closeDeleteTurnoModalBtn = document.getElementById("close-delete-turno-modal");
    const btnConfirmDeleteTurno = document.getElementById("btn-confirm-delete-turno");
    const btnCancelDeleteTurno = document.getElementById("btn-cancel-delete-turno");
    const deleteTurnoInfo = document.getElementById("delete-turno-info");

    // === NUEVOS SELECTORES ===
    // Modal de Éxito
    const successTurnoModal = document.getElementById("modal-success-turno");
    const closeSuccessTurnoModalBtn = document.getElementById("close-success-turno-modal");
    const btnSuccessTurnoOk = document.getElementById("btn-success-turno-ok");
    const successTurnoMessage = document.getElementById("success-turno-message");

    // Modal de Error
    const errorTurnoModal = document.getElementById("modal-error-turno");
    const closeErrorTurnoModalBtn = document.getElementById("close-error-turno-modal");
    const btnErrorTurnoOk = document.getElementById("btn-error-turno-ok");
    const errorTurnoMessage = document.getElementById("error-turno-message");
    // === FIN NUEVOS SELECTORES ===

    // Cargo los turnos 
    cargarTurnos();
    
    // Event listeners para navegación
    document.getElementById("cerrar-sesion").addEventListener("click", function(e) {
        e.preventDefault();
        window.location.href = "index.html";
    });

    document.getElementById("btn-next-week").addEventListener("click", function() {
        currentDate.setDate(currentDate.getDate() + 7);
        renderAgenda();
    });

    document.getElementById("btn-prev-week").addEventListener("click", function() {
        currentDate.setDate(currentDate.getDate() - 7);
        renderAgenda();
    });

    // Event listeners del modal de agendar
    closeAgendarModalBtn.addEventListener("click", closeAgendarModal);
    cancelAgendarBtn.addEventListener("click", closeAgendarModal);
    document.getElementById("form-agendar").addEventListener("submit", saveTurno);

    // Event listeners del modal de eliminación
    btnConfirmDeleteTurno.addEventListener("click", function() {
        const turnoId = this.dataset.id;
        confirmDeleteTurno(turnoId);
    });
    closeDeleteTurnoModalBtn.addEventListener("click", () => deleteTurnoModal.style.display = "none");
    btnCancelDeleteTurno.addEventListener("click", () => deleteTurnoModal.style.display = "none");

   
    // Event listeners para modal de éxito
    function closeSuccessModal() {
        successTurnoModal.style.display = "none";
    }
    closeSuccessTurnoModalBtn.addEventListener("click", closeSuccessModal);
    btnSuccessTurnoOk.addEventListener("click", closeSuccessModal);

    // Event listeners para modal de error
    function closeErrorModal() {
        errorTurnoModal.style.display = "none";
    }
    closeErrorTurnoModalBtn.addEventListener("click", closeErrorModal);
    btnErrorTurnoOk.addEventListener("click", closeErrorModal);
    

    // Escuchar clics en la tabla de la agenda
    document.getElementById("agenda-body").addEventListener("click", function(e) {
        // Clic en el botón "+ Agendar"
        if (e.target.classList.contains("agendar-btn")) {
            const fecha = e.target.dataset.fecha;
            const hora = e.target.dataset.hora;
            openAgendarModal(fecha, hora);
        }

        // Clic en el botón "X" (Eliminar turno)
        if (e.target.classList.contains("eliminar-turno-btn")) {
            const turnoId = e.target.dataset.id;
            openDeleteTurnoModal(turnoId);
        }
    });

    // Clic fuera de los modales para cerrarlos
    window.addEventListener("click", function(e) {
        if (e.target == agendarModal) closeAgendarModal();
        if (e.target == deleteTurnoModal) deleteTurnoModal.style.display = "none";
        if (e.target == successTurnoModal) closeSuccessModal();
        if (e.target == errorTurnoModal) closeErrorModal();
    });

    /**
     * Carga los turnos desde la API
     */
    async function cargarTurnos() {
        try {
            const response = await fetch(`${API_BASE_URL}/turnos`);
            const result = await response.json();
            
            if (result.success) {
                turnos = result.data || [];
                renderAgenda();
            } else {
                console.error("Error al cargar turnos:", result.error);
                mostrarError("Error al cargar los turnos. Por favor, recarga la página.");
            }
        } catch (error) {
            console.error("Error al cargar turnos:", error);
            mostrarError("Error de conexión. Verifica que el servidor esté corriendo.");
        }
    }

    /**
     * Dibuja la agenda completa (días, horas, botones)
     */
    function renderAgenda() {
        const agendaBody = document.getElementById("agenda-body");
        agendaBody.innerHTML = ""; // Limpia la tabla

        const primerDiaSemana = getMonday(new Date(currentDate));
        
        const ultimoDiaSemana = new Date(primerDiaSemana);
        ultimoDiaSemana.setDate(ultimoDiaSemana.getDate() + 4);
        document.getElementById("semana-titulo").textContent = 
            `Semana del ${primerDiaSemana.toLocaleDateString("es-ES", {day: '2-digit', month: 'long'})} 
             al ${ultimoDiaSemana.toLocaleDateString("es-ES", {day: '2-digit', month: 'long'})}`;

        
       
        const diasSemanaIds = ["lunes", "martes", "miercoles", "jueves", "viernes"];
        const diasNombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

        for (let i = 0; i < 5; i++) {
            const diaActual = new Date(primerDiaSemana);
            diaActual.setDate(diaActual.getDate() + i);
            
            const dia = diaActual.getDate();
            const mes = diaActual.getMonth() + 1; // getMonth() es 0-indexado
            const fechaFormateada = `${dia}/${mes}`;
            
            const headerCell = document.getElementById(`header-${diasSemanaIds[i]}`);
            if (headerCell) {
                // Usamos innerHTML para añadir un salto de línea y la fecha
                headerCell.innerHTML = `${diasNombres[i]} <br> <span class="fecha-header">${fechaFormateada}</span>`;
            }
        }
        


        const horarios = [];
        let hora = new Date();
        hora.setHours(8, 0, 0, 0); // Empieza a las 8:00

        while (hora.getHours() < 19) {
            horarios.push(hora.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' }));
            hora.setMinutes(hora.getMinutes() + 40);
        }

        for (const horaStr of horarios) {
            const fila = document.createElement("tr");
            
            const celdaHora = document.createElement("td");
            celdaHora.className = "hora-col";
            celdaHora.textContent = horaStr;
            fila.appendChild(celdaHora);

            for (let i = 0; i < 5; i++) {
                const diaActual = new Date(primerDiaSemana);
                diaActual.setDate(diaActual.getDate() + i);
                
                const fechaISO = diaActual.toISOString().split('T')[0]; // "YYYY-MM-DD"
                
                const celdaDia = document.createElement("td");
                
                // Buscar turno en esta fecha y hora
                const turno = findTurnoPorFechaYHora(fechaISO, horaStr);

                if (turno) {
                    celdaDia.innerHTML = `
                        <div class="turno-ocupado">
                            <span class="turno-paciente">${turno.surname}, ${turno.name}</span>
                            <div class="turno-motivo">${turno.description || 'Sin descripción'}</div>
                            <button class="eliminar-turno-btn" data-id="${turno._id}">&times;</button>
                        </div>
                    `;
                } else {
                    celdaDia.innerHTML = `
                        <button class="agendar-btn" data-fecha="${fechaISO}" data-hora="${horaStr}">+ Agendar</button>
                    `;
                }
                fila.appendChild(celdaDia);
            }
            agendaBody.appendChild(fila);
        }
    }

    /**
     * Abre el modal para agendar un turno
     */
    function openAgendarModal(fecha, hora) {
        agendarModal.style.display = "block";
        
        // Formatear la fecha para mostrarla
        const fechaObj = new Date(fecha + 'T00:00:00');
        const fechaFormateada = fechaObj.toLocaleDateString("es-ES", {
            weekday: 'long', 
            day: 'numeric', 
            month: 'long'
        });
        
        document.getElementById("modal-horario").textContent = 
            `${fechaFormateada} a las ${hora} hs`;
        
        // Preestablecer fecha y hora (ocultos)
        document.getElementById("modal-fecha").value = fecha;
        document.getElementById("modal-hora").value = hora;
        
        // Limpiar el formulario
        document.getElementById("form-agendar").reset();
        
        // Reestablecer los valores ocultos después de reset
        document.getElementById("modal-fecha").value = fecha;
        document.getElementById("modal-hora").value = hora;
    }

    /**
     * Cierra el modal de agendar
     */
    function closeAgendarModal() {
        agendarModal.style.display = "none";
    }

    /**
     * Guarda el turno en el backend
     */
    async function saveTurno(e) {
        e.preventDefault();

        const fecha = document.getElementById("modal-fecha").value;
        const hora = document.getElementById("modal-hora").value;
        
        // Construir el timestamp completo (fecha + hora)
        const assignedSchedule = `${fecha}T${hora}:00`;

        const turnoData = {
            assigned_schedule: assignedSchedule,
            description: document.getElementById("modal-motivo").value || null,
            dni: parseInt(document.getElementById("modal-dni").value),
            name: document.getElementById("modal-nombre").value,
            surname: document.getElementById("modal-apellido").value,
            phone: document.getElementById("modal-telefono").value || null,
            medical_insurance: document.getElementById("modal-obraSocial").value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/turnos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(turnoData)
            });

            const result = await response.json();

            if (result.success) {
                closeAgendarModal();
                mostrarExito("Turno creado correctamente");
                cargarTurnos(); // Recargar los turnos
            } else {
                mostrarError(result.error || "Error al crear el turno");
            }
        } catch (error) {
            console.error("Error al crear turno:", error);
            mostrarError("Error de conexión. Verifica que el servidor esté corriendo.");
        }
    }

    /**
     * Abre el modal de confirmación de eliminación
     */
    function openDeleteTurnoModal(turnoId) {
        const turno = turnos.find(t => t._id === turnoId);
        if (!turno) return;
        
        const fechaObj = new Date(turno.assigned_schedule);
        const fechaFormateada = fechaObj.toLocaleDateString("es-ES");
        const horaFormateada = fechaObj.toLocaleTimeString("es-ES", { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        deleteTurnoInfo.textContent = 
            `Paciente: ${turno.surname}, ${turno.name} - Fecha: ${fechaFormateada} - Hora: ${horaFormateada}`;
        btnConfirmDeleteTurno.dataset.id = turnoId;
        deleteTurnoModal.style.display = "block";
    }

    /**
     * Confirma y ejecuta la eliminación del turno
     */
    async function confirmDeleteTurno(turnoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/turnos/${turnoId}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (result.success) {
                deleteTurnoModal.style.display = "none";
                mostrarExito("Turno eliminado correctamente");
                cargarTurnos(); // Recargar los turnos
            } else {
                mostrarError(result.error || "Error al eliminar el turno");
            }
        } catch (error) {
            console.error("Error al eliminar turno:", error);
            mostrarError("Error de conexión. Verifica que el servidor esté corriendo.");
        }
    }

    // Funciones de ayuda (Helpers)

    /**
     * Busca un turno por fecha y hora
     */
    function findTurnoPorFechaYHora(fecha, horaStr) {
        return turnos.find(t => {
            const turnoDate = new Date(t.assigned_schedule);
            const turnoFecha = turnoDate.toISOString().split('T')[0];
            const turnoHora = turnoDate.toLocaleTimeString("es-ES", { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            return turnoFecha === fecha && turnoHora === horaStr;
        });
    }

    /**
     * Obtiene el lunes de la semana de una fecha
     */
    function getMonday(d) {
        d = new Date(d);
        let day = d.getDay();
        let diff = d.getDate() - day + (day == 0 ? -6 : 1); // Si es domingo (0), retrocede 6 días; si no, retrocede (day-1)
        return new Date(d.setDate(diff));
    }

    /**
     * Muestra un mensaje de error
     */
    function mostrarError(mensaje) {
        // alert("Error: " + mensaje); // Reemplazado
        errorTurnoMessage.textContent = mensaje;
        errorTurnoModal.style.display = "block";
    }

    /**
     * Muestra un mensaje de éxito
     */
    function mostrarExito(mensaje) {
        // alert("✓ " + mensaje); // Reemplazado
        successTurnoMessage.textContent = mensaje;
        successTurnoModal.style.display = "block";
    }
});