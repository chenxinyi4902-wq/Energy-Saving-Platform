// ================= USER SESSION =================
const currentUser = localStorage.getItem("username");

if (!currentUser) {
    window.location.href = "/";
}

// ================= PAGE INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initializePage();
});

function initializePage() {
    updateGreeting();
    bindUsageForm();
    bindTargetButton();
    checkMonthlyTarget();
    loadDashboardData();
}

// ================= HEADER =================
function updateGreeting() {
    const greetingTitle = document.querySelector("header h2");
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

                if (monthlyTarget === null || monthlyTarget === "" || monthlyTarget === undefined) {
                    showTargetModal();
                } else {
                    hideTargetModal();
                }
            } else {
                showTargetModal();
            }
        })
        .catch(error => {
            console.error("Error checking monthly target:", error);
            showTargetModal();
        });
}

function showTargetModal() {
    const modal = document.getElementById("target-modal");

    if (modal) {
        modal.style.display = "flex";
    }

    document.body.classList.add("is-locked");
}

function hideTargetModal() {
    const modal = document.getElementById("target-modal");

    if (modal) {
        modal.style.display = "none";
    }

    document.body.classList.remove("is-locked");
}

function handleSetTarget() {
    const targetInput = document.getElementById("monthly-target-input");
    const targetValue = targetInput ? targetInput.value.trim() : "";

    if (targetValue === "") {
        alert("Please enter your monthly electricity target.");
        return;
    }

    const numericTarget = parseFloat(targetValue);

    if (isNaN(numericTarget) || numericTarget <= 0) {
        alert("Please enter a valid target greater than 0.");
        return;
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
                console.log("Monthly target set successfully.");
            } else {
                alert(data.message || "Failed to save monthly target.");
            }
        })
        .catch(error => {
            console.error("Error setting monthly target:", error);
            alert("Something went wrong while saving the target.");
        });
}

// ================= DAILY INPUT =================
function bindUsageForm() {
    const usageForm = document.getElementById("usage-form");

    if (usageForm) {
        usageForm.addEventListener("submit", handleUsageSubmit);
    }
}

function handleUsageSubmit(event) {
    event.preventDefault();

    const usageInput = document.getElementById("usage");
    const usageValue = usageInput ? usageInput.value.trim() : "";

    if (usageValue === "") {
        alert("Please enter today's electricity usage.");
        return;
    }

    const numericUsage = parseFloat(usageValue);

    if (isNaN(numericUsage) || numericUsage < 0) {
        alert("Please enter a valid electricity usage value.");
        return;
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
                alert("Daily usage saved successfully.");

                if (usageInput) {
                    usageInput.value = "";
                }

                loadDashboardData();
            } else {
                alert(data.message || "Failed to save daily usage.");
            }
        })
        .catch(error => {
            console.error("Error saving daily usage:", error);
            alert("Something went wrong while saving daily usage.");
        });
}


// ================= DASHBOARD DATA =================
function loadDashboardData() {
    loadEnergySummary();
    loadWeeklySummary();
}

function loadEnergySummary() {
    fetch(`/energy-summary?username=${encodeURIComponent(currentUser)}`)
        .then(response => response.json())
        .then(data => {
            updateMonthlyUsage(data.total_energy_this_month);
            updatePoints(data.points_earned);
            updateMonthlyProgress(data.save_percentage, data.saved_energy, data.prorated_target);
        })
        .catch(error => {
            console.error("Error loading energy summary:", error);
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
        });
}

// ================= UI UPDATE FUNCTIONS =================

function updatePoints(points) {
    const pointsDisplay = document.getElementById("points-display");
    const totalPoints = document.getElementById("total-points");

    const safePoints = points ?? 0;

    if (pointsDisplay) {
        pointsDisplay.textContent = safePoints;
    }

    if (totalPoints) {
        totalPoints.textContent = safePoints;
    }
}

function updateWeeklyUsage(weeklyValue) {
    const weeklyUsage = document.getElementById("weekly-usage");

    if (weeklyUsage) {
        weeklyUsage.textContent = weeklyValue ?? 0;
    }
}

function updateMonthlyUsage(monthlyValue) {
    const monthlyUsage = document.getElementById("monthly-usage");

    if (monthlyUsage) {
        monthlyUsage.textContent = monthlyValue ?? 0;
    }
}

function updateMonthlyProgress(savePercentage, savedEnergy, proratedTarget) {
    const monthlyProgress = document.getElementById("monthly-progress");

    if (!monthlyProgress) return;

    monthlyProgress.innerHTML = `
        <h3 class="card-title">Monthly Progress</h3>
        <p>Saved Energy: ${savedEnergy ?? 0} kWh</p>
        <p>Saving Rate: ${savePercentage ?? 0}%</p>
        <p>Current Target: ${proratedTarget ?? 0} kWh</p>
    `;
}