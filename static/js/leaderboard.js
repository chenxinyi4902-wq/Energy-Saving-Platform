document.addEventListener("DOMContentLoaded", () => {
    initializeLeaderboardPage();
});

function initializeLeaderboardPage() {
    loadLeaderboardData();
}

function loadLeaderboardData() {
    const leaderboardTableBody = document.getElementById("leaderboard-table-body");

    if (!leaderboardTableBody) {
        console.error("leaderboard-table-body not found.");
        return;
    }

    // Backend leaderboard data will be loaded here in future iterations.
    renderEmptyLeaderboard();
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
            <td>${index + 1}</td>
            <td>${user.username ?? "--"}</td>
            <td>${user.points ?? "--"}</td>
        `;

        leaderboardTableBody.appendChild(row);
    });
}

function renderEmptyLeaderboard() {
    const leaderboardTableBody = document.getElementById("leaderboard-table-body");

    if (!leaderboardTableBody) {
        return;
    }

    leaderboardTableBody.innerHTML = `
        <tr class="empty-row">
            <td colspan="3">Leaderboard data will be rendered here.</td>
        </tr>
    `;
}