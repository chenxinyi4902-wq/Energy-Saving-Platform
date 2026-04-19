// ================= USER SESSION =================
const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    window.location.href = "/";
}

let energyChart = null;

// ================= PAGE INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initializePage();
});

function initializePage() {
    updateGreeting();
    bindUsageForm();
    bindUsageInputFilter();
    bindTargetButton();
    checkMonthlyTarget();
    loadLeaderboardPreview();
}

// ================= MESSAGE HELPERS =================
function showPageMessage(message, type = "info") {
    const box = document.getElementById("page-message");
    if (!box) return;

    box.textContent = message;
    box.className = `page-message ${type}`;
    box.classList.remove("hidden");
}

function hidePageMessage() {
    const box = document.getElementById("page-message");
    if (!box) return;

    box.textContent = "";
    box.className = "page-message hidden";
}

function showTargetModalMessage(message, type = "error") {
    const box = document.getElementById("target-modal-message");
    if (!box) return;

    box.textContent = message;
    box.className = `page-message ${type}`;
    box.classList.remove("hidden");
}

function hideTargetModalMessage() {
    const box = document.getElementById("target-modal-message");
    if (!box) return;

    box.textContent = "";
    box.className = "page-message hidden";
}

// ================= HEADER =================
function updateGreeting() {
    const greetingTitle = document.getElementById("greeting-title");
    if (!greetingTitle) return;

    const hour = new Date().getHours();
    let greetingText = "Good Afternoon";

    if (hour < 6) {
        greetingText = "Good Night";
    } else if (hour < 12) {
        greetingText = "Good Morning";
    } else if (hour < 17) {
        greetingText = "Good Afternoon";
    } else if (hour < 22) {
        greetingText = "Good Evening";
    } else {
        greetingText = "Good Night";
    }

    greetingTitle.innerHTML = `${greetingText}, <span>${currentUser}</span>`;
}

function updateHeaderProgress(usageProgress) {
    const headerSubtitle = document.getElementById("header-subtitle");

    if (!headerSubtitle) return;

    if (usageProgress === undefined || usageProgress === null || usageProgress === "--") {
        headerSubtitle.textContent = "Current Usage Progress: --";
        return;
    }

    headerSubtitle.textContent = `Current Usage Progress: ${usageProgress}%`;
}
// ================= MONTHLY TARGET MODAL =================
function bindTargetButton() {
    const submitBtn = document.getElementById("submit-target-btn");

    if (submitBtn) {
        submitBtn.addEventListener("click", handleSetTarget);
    }
}

function checkMonthlyTarget() {
    fetch(`/get-user-info?username=${encodeURIComponent(currentUser)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const monthlyTarget = data.monthly_target;
                const currentPoints = data.current_points;
                updateBalanceOnly(currentPoints);

                if (monthlyTarget === null || monthlyTarget === "" || monthlyTarget === undefined) {
                    renderDashboardPlaceholder();
                    showTargetModal();
                } else {
                    hideTargetModal();
                    loadDashboardData();
                }
            } else {
                renderDashboardPlaceholder();
                showTargetModal();
            }
        })
        .catch(error => {
            console.error("Error checking monthly target:", error);
            renderDashboardPlaceholder();
            showTargetModal();
        });
}

function showTargetModal() {
    const overlay = document.getElementById("target-overlay");
    const modal = document.getElementById("target-modal");

    if (overlay) {
        overlay.style.display = "flex";
    }

    if (modal) {
        modal.style.display = "flex";
    }

    document.body.classList.add("is-locked");
}

function hideTargetModal() {
    const overlay = document.getElementById("target-overlay");
    const modal = document.getElementById("target-modal");

    if (overlay) {
        overlay.style.display = "none";
    }

    if (modal) {
        modal.style.display = "none";
    }
    hideTargetModalMessage();
    document.body.classList.remove("is-locked");
}

function handleSetTarget() {
    const targetInput = document.getElementById("monthly-target-input");
    const submitBtn = document.getElementById("submit-target-btn");
    const targetValue = targetInput ? targetInput.value.trim() : "";

    hideTargetModalMessage();

    if (targetValue === "") {
        showTargetModalMessage("Please enter your monthly electricity target.", "error");
        return;
    }

    const numericTarget = parseFloat(targetValue);

    if (isNaN(numericTarget) || numericTarget <= 0) {
        showTargetModalMessage("Please enter a valid target greater than 0.", "error");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";
    }

    fetch("/set-target", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: currentUser,
            target: numericTarget
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.target !== undefined) {
                hideTargetModal();

                loadDashboardData();

                showPageMessage("Monthly target saved successfully.", "success");
                console.log("Monthly target set successfully.");
            } else {
                showTargetModalMessage(data.message || "Failed to save monthly target.","error");
            }
        })
        .catch(error => {
            console.error("Error setting monthly target:", error);
            showTargetModalMessage("Something went wrong while saving the target.","error");
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Save Target";
            }
        });
}

// ================= DAILY INPUT =================
function bindUsageForm() {
    const usageForm = document.getElementById("usage-form");

    if (usageForm) {
        usageForm.addEventListener("submit", handleUsageSubmit);
    }
}

function bindUsageInputFilter() {
    const usageInput = document.getElementById("usage");

    if (!usageInput) {
        return;
    }

    usageInput.addEventListener("input", () => {
        let value = usageInput.value;
        value = value.replace(/。/g, ".");
        value = value.replace(/，/g, ".");
        value = value.replace(/,/g, ".");
        value = value.replace(/[^0-9.]/g, "");
        const parts = value.split(".");
        if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
        }

        usageInput.value = value;
    });
}

function handleUsageSubmit(event) {
    event.preventDefault();

    hidePageMessage();

    const usageInput = document.getElementById("usage");
    const saveBtn = document.getElementById("save-usage-btn");
    const usageValue = usageInput ? usageInput.value.trim().replace(",", ".") : "";

    if (usageValue === "") {
        showPageMessage("Please enter today's electricity usage.","error");
        return;
    }

    const numericUsage = parseFloat(usageValue);

    if (isNaN(numericUsage) || numericUsage < 0) {
        showPageMessage("Please enter a valid electricity usage value.","error");
        return;
    }

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
    }

    fetch("/add-energy", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: currentUser,
            energy: numericUsage
        })
    })
        .then(response => response.json())
        .then(data => {
            if (
                data.message === "energy added" ||
                data.message === "today's record updated"
            ) {
                showPageMessage("Daily usage saved successfully.","success");

                if (usageInput) {
                    usageInput.value = "";
                }

                loadDashboardData();
                loadLeaderboardPreview();
            } else {
                showPageMessage(data.message || "Failed to save daily usage.","error");
            }
        })
        .catch(error => {
            console.error("Error saving daily usage:", error);
            showPageMessage("Something went wrong while saving daily usage.","error");
        })
        .finally(() => {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save";
            }
        });
}


// ================= DASHBOARD DATA =================
function loadDashboardData() {
    loadEnergySummary();
    loadWeeklySummary();
    loadUsageTrend();
}

function loadEnergySummary() {
    fetch(`/energy-summary?username=${encodeURIComponent(currentUser)}`)
        .then(response => response.json())
        .then(data => {
            updateMonthlyUsage(data.total_energy_this_cycle);
            updatePoints(data.predicted_points, data.current_points);
            updateMonthlyProgress(
                data.monthly_target,
                data.predicted_cycle_total,
                data.predicted_save_percentage
            );
            updateHeaderProgress(data.usage_progress);
        })
        .catch(error => {
            console.error("Error loading energy summary:", error);
            showPageMessage("Unable to load monthly summary right now.", "error");
            updateHeaderProgress(null);
        });
}

function loadWeeklySummary() {
    fetch(`/weekly-summary?username=${encodeURIComponent(currentUser)}`)
        .then(response => response.json())
        .then(data => {
            updateWeeklyUsage(data.total_energy_this_week);
        })
        .catch(error => {
            console.error("Error loading weekly summary:", error);
            showPageMessage("Unable to load weekly summary right now.", "error");
        });
}

function loadUsageTrend() {
    fetch(`/user-data?username=${encodeURIComponent(currentUser)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Trend request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.records || data.records.length === 0) {
                showChartEmptyState("No usage records yet. Your trend chart will update after your first entry.");
                renderEmptyEnergyChart();
                return;
            }

            const records = [...data.records].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );

            hideChartEmptyState();
            renderEnergyChart(records);
        })
        .catch(error => {
            console.error("Error loading usage trend data:", error);
            showChartEmptyState("Trend data could not be loaded right now.");
            destroyChartIfExists();
        });
}

function loadLeaderboardPreview() {
    const leaderboardList = document.getElementById("leaderboard-list");

    if (!leaderboardList) {
        console.error("leaderboard-list not found.");
        return;
    }

    fetch("/leaderboard-data")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Leaderboard request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.leaderboard || data.leaderboard.length === 0) {
                renderLeaderboardPreviewEmpty("No leaderboard data available.");
                return;
            }

            renderLeaderboardPreview(data.leaderboard);
        })
        .catch(error => {
            console.error("Error loading leaderboard preview:", error);
            renderLeaderboardPreviewEmpty("Failed to load leaderboard data.");
        });
}

function renderLeaderboardPreview(leaderboardData) {
    const leaderboardList = document.getElementById("leaderboard-list");

    if (!leaderboardList) return;

    leaderboardList.innerHTML = "";

    leaderboardData.slice(0, 5).forEach(user => {
        const row = document.createElement("div");
        row.className = "lb-row";

        row.innerHTML = `
            <span>#${user.rank ?? "--"}</span>
            <span>${user.username ?? "--"}</span>
            <span>${user.total_points ?? 0} pts</span>
        `;

        leaderboardList.appendChild(row);
    });
}

function renderLeaderboardPreviewEmpty(message) {
    const leaderboardList = document.getElementById("leaderboard-list");

    if (!leaderboardList) return;

    leaderboardList.innerHTML = `
        <div class="lb-row pending">
            <span>${message}</span>
        </div>
    `;
}

// ================= CHART HELPERS =================
function showChartEmptyState(message) {
    const emptyText = document.getElementById("chart-empty-message");
    const chartContainer = document.querySelector(".chart-container");
    if (!emptyText) return;

    emptyText.textContent = message;
    emptyText.classList.remove("hidden");

    if (chartContainer) {
        chartContainer.style.display = "none";
    }
}

function hideChartEmptyState() {
    const emptyText = document.getElementById("chart-empty-message");
    const chartContainer = document.querySelector(".chart-container");
    if (!emptyText) return;

    emptyText.classList.add("hidden");
    if (chartContainer) {
        chartContainer.style.display = "block";
    }
}

function destroyChartIfExists() {
    if (energyChart) {
        energyChart.destroy();
        energyChart = null;
    }
}

// Temporary chart styling for the current iteration; colors and gradient effects can be refined in later iterations.
function renderEmptyEnergyChart() {
    const today = new Date();
    const labels = [];
    const zeroRecords = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const label = `${month}-${day}`;

        labels.push(label);
        zeroRecords.push({
            date: label,
            energy: 0
        });
    }

    hideChartEmptyState();
    renderEnergyChart(zeroRecords, labels);
    showChartEmptyState("No usage records yet. The chart is ready for your first entry.");
}

function renderEnergyChart(records, customLabels = null) {
    const canvas = document.getElementById("energyChart");

    if (!canvas) {
        console.error("energyChart canvas not found.");
        return;
    }

    const ctx = canvas.getContext("2d");

    const labels = records.map(record => record.date.slice(5));
    const values = records.map(record => record.energy);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(34, 197, 94, 0.35)");
    gradient.addColorStop(0.5, "rgba(34, 197, 94, 0.16)");
    gradient.addColorStop(1, "rgba(34, 197, 94, 0.03)");

    if (energyChart) {
        energyChart.destroy();
    }

    energyChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Daily Energy Usage (kWh)",
                    data: values,
                    borderColor: "rgba(34, 197, 94, 1)",
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.45,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "rgba(34, 197, 94, 1)",
                    pointBorderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0, 0, 0, 0.06)"
                    }
                }
            }
        }
    });
}

// ================= PLACEHOLDER STATE =================
function renderDashboardPlaceholder() {
    updateHeaderProgress(null);
    updateMonthlyUsage("--");
    updateWeeklyUsage("--");
    updatePoints("--", "--");
    updateMonthlyProgress("--", "--", "--");

    showChartEmptyState("Set your monthly target to unlock dashboard data.");
    destroyChartIfExists();
}

// ================= UI UPDATE FUNCTIONS =================
function updatePoints(pointsEarned, currentPointsValue) {
    const pointsDisplay = document.getElementById("points-display");
    const totalPoints = document.getElementById("total-points");
    const sidebarPoints = document.getElementById("sidebar-points");

    const safeEarnedPoints = pointsEarned ?? "--";
    const safeCurrentPoints = currentPointsValue ?? "--";

    if (pointsDisplay) {
        pointsDisplay.textContent = safeEarnedPoints;
    }

    if (totalPoints) {
        totalPoints.textContent = safeCurrentPoints;
    }

    if (sidebarPoints) {
        sidebarPoints.textContent = safeCurrentPoints;
    }
}

function updateBalanceOnly(currentPointsValue) {
    const totalPoints = document.getElementById("total-points");
    const sidebarPoints = document.getElementById("sidebar-points");

    if (totalPoints) {
        totalPoints.textContent = currentPointsValue ?? "--";
    }

    if (sidebarPoints) {
        sidebarPoints.textContent = currentPointsValue ?? "--";
    }
}

function updateWeeklyUsage(weeklyValue) {
    const weeklyUsage = document.getElementById("weekly-usage");

    if (weeklyUsage) {
        weeklyUsage.textContent = weeklyValue ?? "--";
    }
}

function updateMonthlyUsage(monthlyValue) {
    const monthlyUsage = document.getElementById("monthly-usage");

    if (monthlyUsage) {
        monthlyUsage.textContent = monthlyValue ?? "--";
    }
}

function updateMonthlyProgress(monthlyTarget, predictedTotalUsage, predictedSaveRate) {
    const monthlyProgress = document.getElementById("monthly-progress");

    if (!monthlyProgress) return;

    const safeMonthlyTarget = monthlyTarget ?? "--";
    const safePredictedTotalUsage = predictedTotalUsage ?? "--";
    const safePredictedSaveRate = predictedSaveRate ?? "--";

    monthlyProgress.innerHTML = `
        <h3 class="card-title">Monthly Progress</h3>
        <p>Monthly Target: <span id="monthly-target-display">${safeMonthlyTarget}</span> kWh</p>
        <p>Predicted Total Usage: <span id="predicted-cycle-total">${safePredictedTotalUsage}</span> kWh</p>
        <p>Predicted Saving Rate: <span id="predicted-save-rate">${safePredictedSaveRate}</span>%</p>
    `;
}
