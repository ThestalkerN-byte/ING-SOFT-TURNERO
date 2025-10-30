document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pacienteForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const newPatient = {
            name: document.getElementById("name").value,
            surname: document.getElementById("surname").value,
            age: document.getElementById("age").value,
            dni: document.getElementById("dni").value,
            obraSocial: document.getElementById("obraSocial").value,
            phone: document.getElementById("phone").value
        };

        let patients = JSON.parse(localStorage.getItem("paciente")) || [];
        patients.push(newPatient);
        localStorage.setItem("paciente", JSON.stringify(patients));

        alert("Paciente registrado con exito!");
        window.location.href = "pacienteList.html";
    });
});
