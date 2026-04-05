const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    window.location.href = "/";
}

// ================= PAGE INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
    initializeHistoryPage();
});

function initializeHistoryPage() {
    updateGreeting();
    updateUsername();
    loadHistoryData();
}

function updateGreeting() {
    const greetingText = document.getElementById("greeting-text");
    if (!greetingText) return;

    const currentHour = new Date().getHours();
    let greeting = "Welcome";

    if (currentHour < 12) {
        greeting = "Good Morning";
    } else if (currentHour < 18) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }

    greetingText.textContent = greeting;
}

function updateUsername() {
    const usernameElement = document.getElementById("header-username");
    if (!usernameElement) return;

    usernameElement.textContent = currentUser;
}

function renderEmptyState(message) {
    const historyTableBody = document.getElementById("history-table-body");
    if (!historyTableBody) return;

        historyTableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="2">${message}</td>
            </tr>
        `;
    }

async function loadHistoryData() {
    const historyTableBody = document.getElementById("history-table-body");
    const sidebarPoints = document.getElementById("sidebar-points");

    if (!historyTableBody) {
        console.error("history-table-body not found.");
        return;
    }

    try {
        const response = await fetch(`/user-data?username=${currentUser}`);
        if (!response.ok) {
        throw new Error("Failed to fetch user data.");
        }

        const data = await response.json();
        if (sidebarPoints) {
            sidebarPoints.textContent = data.points !== undefined ? data.points : 0;
        }

        if (!data.energy_records || data.energy_records.length === 0) {
            renderEmptyState("No history records available.");
            return;
        }

        const records = data.energy_records.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        renderHistoryTable(records);
    } catch (error) {
        console.error("Failed to load history data:", error);
        renderEmptyState("Failed to load history records.");
    }
}

function renderHistoryTable(records) {
    const historyTableBody = document.getElementById("history-table-body");
    if (!historyTableBody) return;

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