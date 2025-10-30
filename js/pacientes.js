document.addEventListener("DOMContentLoaded", function() {
    
    // --- MANEJO DE NAVEGACIÓN ---

    document.getElementById("cerrar-sesion").addEventListener("click", function(e) {
        e.preventDefault();
        window.location.href = "index.html"; 
    });



    // FUNCIONALIDAD DEL BUSCADOR
    
    const searchInput = document.getElementById("paciente-search");
    
    searchInput.addEventListener("keyup", function() {
        // 1. Obtener el texto de búsqueda (en minúsculas)
        const filtro = searchInput.value.toLowerCase();
        
        // 2. Seleccionar el cuerpo de la tabla y todas sus filas (los <tr>)
        const tablaBody = document.getElementById("pacientes-tbody");
        const filas = tablaBody.getElementsByTagName("tr");

        // 3. Recorrer cada fila de la tabla
        for (let i = 0; i < filas.length; i++) {
            const fila = filas[i];
            
            // 4. Obtener las celdas (<td>)
            const celdaNombre = fila.cells[0];   // Col 0: Nombre
            const celdaApellido = fila.cells[1]; // Col 1: Apellido
            const celdaDNI = fila.cells[2];      // Col 2: DNI
            
            if (celdaNombre && celdaApellido && celdaDNI) {
                const textoNombre = celdaNombre.textContent.toLowerCase();
                const textoApellido = celdaApellido.textContent.toLowerCase();
                const textoDNI = celdaDNI.textContent.toLowerCase();

                // 5. Comprobar si el filtro coincide con Nombre, Apellido o DNI
                if (textoNombre.includes(filtro) || textoApellido.includes(filtro) || textoDNI.includes(filtro)) {
                    // Si coincide, se muestra la fila
                    fila.style.display = ""; // "" = valor por defecto (visible)
                } else {
                    // Si no coincide, se oculta la fila
                    fila.style.display = "none";
                }
            }
        }
    });

    
});