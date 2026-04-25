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
    loadUserInfo();
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

async function loadUserInfo() {
    const sidebarPoints = document.getElementById("sidebar-points");
    if (!sidebarPoints) return;

    try {
        const response = await fetch(`/get-user-info?username=${encodeURIComponent(currentUser)}`);

        if (!response.ok) {
            throw new Error("Failed to fetch user info.");
        }

        const data = await response.json();
        sidebarPoints.textContent = data.current_points !== undefined ? data.current_points : 0;
    } catch (error) {
        console.error("Failed to load user info:", error);
        sidebarPoints.textContent = "--";
    }
}

async function loadHistoryData() {
    const historyTableBody = document.getElementById("history-table-body");

    if (!historyTableBody) {
        console.error("history-table-body not found.");
        return;
    }

    try {
        const response = await fetch(`/user-data?username=${encodeURIComponent(currentUser)}`);
        if (!response.ok) {
        throw new Error("Failed to fetch user data.");
        }

        const data = await response.json();

        if (!data.records || data.records.length === 0) {
            renderEmptyState("No history records available.");
            return;
        }

        const records = [...data.records].sort(
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