// Espera a que el contenido se cargue
document.addEventListener("DOMContentLoaded", function() {

    // --- VARIABLES GLOBALES ---
    let currentDate = new Date(); // Guarda la fecha actual
    
    // Modal de Agendar
    const agendarModal = document.getElementById("modal-agendar");
    // ¡ID Corregido y Verificado!
    const closeAgendarModalBtn = document.getElementById("close-agendar-modal");
    
    // Modal de Eliminar Turno
    const deleteTurnoModal = document.getElementById("modal-delete-turno");
    const closeDeleteTurnoModalBtn = document.getElementById("close-delete-turno-modal");
    const btnConfirmDeleteTurno = document.getElementById("btn-confirm-delete-turno");
    const btnCancelDeleteTurno = document.getElementById("btn-cancel-delete-turno");
    const deleteTurnoInfo = document.getElementById("delete-turno-info");
    
    // Almacenamiento "simulado"
    let turnos = JSON.parse(localStorage.getItem('turnos')) || [];
    let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

    // --- INICIALIZACIÓN ---
    // startClock();
    renderAgenda();

    // --- MANEJADORES DE EVENTOS (EVENT LISTENERS) ---
    
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

    // Clic en "Cerrar" (X) en el modal de AGENDAR
    closeAgendarModalBtn.addEventListener("click", closeAgendarModal);

    // Guardar el formulario del modal de AGENDAR
    document.getElementById("form-agendar").addEventListener("submit", saveTurno);

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
    
    // --- Eventos del Modal de Eliminación ---
    
    // Clic en "Confirmar Eliminación"
    btnConfirmDeleteTurno.addEventListener("click", function() {
        const turnoId = this.dataset.id;
        confirmDeleteTurno(turnoId);
    });
    
    // Clics para cerrar el modal de eliminación
    closeDeleteTurnoModalBtn.addEventListener("click", () => deleteTurnoModal.style.display = "none");
    btnCancelDeleteTurno.addEventListener("click", () => deleteTurnoModal.style.display = "none");

    // Clic fuera de los modales (cierra el modal activo)
    window.addEventListener("click", function(e) {
        if (e.target == agendarModal) {
            closeAgendarModal();
        }
        if (e.target == deleteTurnoModal) {
            deleteTurnoModal.style.display = "none";
        }
    });


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

        const horarios = [];
        let hora = new Date();
        hora.setHours(8, 0, 0, 0); // Empieza a las 8:00

        while (hora.getHours() < 19) {
            horarios.push(hora.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' }));
            hora.setMinutes(hora.getMinutes() + 40);
        }

        for (const hora of horarios) {
            const fila = document.createElement("tr");
            
            const celdaHora = document.createElement("td");
            celdaHora.className = "hora-col";
            celdaHora.textContent = hora;
            fila.appendChild(celdaHora);

            for (let i = 0; i < 5; i++) {
                const diaActual = new Date(primerDiaSemana);
                diaActual.setDate(diaActual.getDate() + i);
                
                const fechaISO = diaActual.toISOString().split('T')[0]; // "YYYY-MM-DD"
                
                const celdaDia = document.createElement("td");
                
                const turno = findTurno(fechaISO, hora);

                if (turno) {
                    const paciente = findPacienteByDNI(turno.pacienteDNI);
                    celdaDia.innerHTML = `
                        <div class="turno-ocupado">
                            <span class="turno-paciente">${paciente.apellido}, ${paciente.nombre}</span>
                            <div class="turno-motivo">${turno.motivo}</div>
                            <button class="eliminar-turno-btn" data-id="${turno.id}">&times;</button>
                        </div>
                    `;
                } else {
                    celdaDia.innerHTML = `
                        <button class="agendar-btn" data-fecha="${fechaISO}" data-hora="${hora}">+ Agendar</button>
                    `;
                }
                fila.appendChild(celdaDia);
            }
            agendaBody.appendChild(fila);
        }
    }

    /**
     * Abre el pop-up (modal) para agendar
     */
    function openAgendarModal(fecha, hora) {
        agendarModal.style.display = "block";
        document.getElementById("modal-horario").textContent = `${new Date(fecha + 'T00:00:00').toLocaleDateString("es-ES", {weekday: 'long', day: 'numeric', month: 'long'})} a las ${hora} hs`;
        
        document.getElementById("form-agendar").reset();
        
        document.getElementById("modal-fecha").value = fecha;
        document.getElementById("modal-hora").value = hora;
    }

    /**
     * Cierra el pop-up (modal) de agendar
     */
    function closeAgendarModal() {
        agendarModal.style.display = "none";
    }

    /**
     * Guarda el turno Y el paciente
     */
    function saveTurno(e) {
        e.preventDefault(); 

        const paciente = {
            dni: document.getElementById("modal-dni").value,
            nombre: document.getElementById("modal-nombre").value,
            apellido: document.getElementById("modal-apellido").value,
            telefono: document.getElementById("modal-telefono").value,
            obraSocial: document.getElementById("modal-obraSocial").value,
        };

        const turno = {
            id: 'turno_' + Date.now(), // ID único
            fecha: document.getElementById("modal-fecha").value,
            hora: document.getElementById("modal-hora").value,
            motivo: document.getElementById("modal-motivo").value,
            pacienteDNI: paciente.dni,
        };

        // Guardar el Paciente (o actualizarlo si ya existe por DNI)
        const pacienteIndex = pacientes.findIndex(p => p.dni === paciente.dni);
        if (pacienteIndex > -1) {
            pacientes[pacienteIndex] = paciente;
        } else {
            pacientes.push(paciente);
        }
        localStorage.setItem('pacientes', JSON.stringify(pacientes));

        // Guardar el Turno
        turnos.push(turno);
        localStorage.setItem('turnos', JSON.stringify(turnos));

        closeAgendarModal();
        renderAgenda();
    }

    /**
     * Abre el modal de confirmación de borrado
     */
    function openDeleteTurnoModal(turnoId) {
        const turno = turnos.find(t => t.id === turnoId);
        if (!turno) return;
        
        const paciente = findPacienteByDNI(turno.pacienteDNI);
        
        deleteTurnoInfo.textContent = `Paciente: ${paciente.apellido}, ${paciente.nombre} - Fecha: ${turno.fecha} - Hora: ${turno.hora}`;
        btnConfirmDeleteTurno.dataset.id = turnoId;
        deleteTurnoModal.style.display = "block";
    }

    /**
     * Lógica que se ejecuta al confirmar la eliminación
     */
    function confirmDeleteTurno(turnoId) {
        turnos = turnos.filter(t => t.id !== turnoId);
        localStorage.setItem('turnos', JSON.stringify(turnos));
        
        deleteTurnoModal.style.display = "none";
        renderAgenda();
    }


    // --- FUNCIONES DE AYUDA (Helpers) ---

    function findTurno(fecha, hora) {
        return turnos.find(t => t.fecha === fecha && t.hora === hora);
    }

    function findPacienteByDNI(dni) {
        return pacientes.find(p => p.dni === dni) || { nombre: "Paciente", apellido: "No encontrado" };
    }
    
    function getMonday(d) {
        d = new Date(d);
        let day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

});