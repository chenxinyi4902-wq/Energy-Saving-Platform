document.addEventListener("DOMContentLoaded", () => {
    loadHistoryData();
});

async function loadHistoryData() {
    const currentUser = localStorage.getItem("currentUser");
    const historyTableBody = document.getElementById("history-table-body");

    if (!historyTableBody) {
        console.error("history-table-body not found.");
        return;
    }

    if (!currentUser) {
        historyTableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="2">Failed to load history records.</td>
            </tr>
        `;
        return;
    }

    try {
        const response = await fetch(`/user-data?username=${currentUser}`);
        const data = await response.json();

        if (!data.energy_records || data.energy_records.length === 0) {
            historyTableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="2">No history records available.</td>
                </tr>
            `;
            return;
        }

        const records = data.energy_records.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        renderHistoryTable(records);
    } catch (error) {
        console.error("Failed to load history data:", error);
        historyTableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="3">Failed to load history records.</td>
            </tr>
        `;
    }
}

function renderHistoryTable(records) {
    const historyTableBody = document.getElementById("history-table-body");
    historyTableBody.innerHTML = "";

    records.forEach(record => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.energy} kWh</td>
        `;

        historyTableBody.appendChild(row);
    });
}