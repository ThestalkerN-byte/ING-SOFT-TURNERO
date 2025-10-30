document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("patientsBody");

    function loadPatients() {
        const patients = JSON.parse(localStorage.getItem("patients")) || [];
        tableBody.innerHTML = "";

        patients.forEach((p, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${p.name}</td>
                <td>${p.surname}</td>
                <td>${p.age}</td>
                <td>${p.dni}</td>
                <td>${p.obraSocial}</td>
                <td>${p.phone}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = e.target.dataset.index;
                if (confirm("Delete this patient?")) {
                    patients.splice(i, 1);
                    localStorage.setItem("patients", JSON.stringify(patients));
                    loadPatients();
                }
            });
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = e.target.dataset.index;
                const p = patients[i];
                localStorage.setItem("editPatient", JSON.stringify({ patient: p, index: i }));
                window.location.href = "pacienteForm.html";
            });
        });
    }

    loadPatients();
});
