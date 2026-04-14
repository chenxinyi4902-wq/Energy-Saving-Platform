const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", () => {
    initializeLeaderboardPage();
});

function initializeLeaderboardPage() {
    loadUserPoints();
    loadLeaderboardData();
}

function loadUserPoints() {
    const sidebarPoints = document.getElementById("sidebar-points");

    if (!sidebarPoints) {
        return;
    }

    fetch(`/get-user-info?username=${encodeURIComponent(currentUser)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch user points.");
            }
            return response.json();
        })
        .then(data => {
            sidebarPoints.textContent = data.total_points ?? "--";
        })
        .catch(error => {
            console.error("Failed to load user points:", error);
            sidebarPoints.textContent = "--";
        });
}

async function loadLeaderboardData() {
    const leaderboardTableBody = document.getElementById("leaderboard-table-body");

    if (!leaderboardTableBody) {
        console.error("leaderboard-table-body not found.");
        return;
    }

    try {
        const response = await fetch("/leaderboard-data");

        if (!response.ok) {
            throw new Error("Failed to fetch leaderboard data.");
        }

        const data = await response.json();

        if (!data.leaderboard || data.leaderboard.length === 0) {
            renderEmptyLeaderboard("No leaderboard data available.");
            return;
        }

        renderLeaderboardTable(data.leaderboard);
    } catch (error) {
        console.error("Failed to load leaderboard data:", error);
        renderEmptyLeaderboard("Failed to load leaderboard data.");
    }
}

function renderLeaderboardTable(data) {
    const leaderboardTableBody = document.getElementById("leaderboard-table-body");

    if (!leaderboardTableBody) {
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        renderEmptyLeaderboard();
        return;
    }

    leaderboardTableBody.innerHTML = "";

    data.forEach((user, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.rank ?? "--"}</td>
            <td>${user.username ?? "--"}</td>
            <td>${user.total_points ?? 0}</td>
        `;

        leaderboardTableBody.appendChild(row);
    });
}

function renderEmptyLeaderboard(message = "No leaderboard data available.") {
    const leaderboardTableBody = document.getElementById("leaderboard-table-body");

    if (!leaderboardTableBody) {
        return;
    }

    leaderboardTableBody.innerHTML = `
        <tr class="empty-row">
            <td colspan="3">${message}</td>
        </tr>
    `;
}