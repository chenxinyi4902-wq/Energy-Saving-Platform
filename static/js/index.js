// ================= USER SESSION =================
const currentUser = localStorage.getItem("username") || "Username";

// ================= PAGE INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
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

    fetch("/set-monthly-target", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: currentUser,
            monthly_target: numericTarget
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                hideTargetModal();
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

    console.log("Daily usage submitted:", {
        username: currentUser,
        usage: numericUsage
    });

    alert("Daily usage saved successfully.");

    if (usageInput) {
        usageInput.value = "";
    }
}

// ================= DASHBOARD DATA =================
function loadDashboardData() {
    loadPoints();
    loadWeeklyUsage();
    loadMonthlyUsage();
}

function loadPoints() {
    const pointsDisplay = document.getElementById("points-display");
    const totalPoints = document.getElementById("total-points");

    const points = 0;

    if (pointsDisplay) {
        pointsDisplay.textContent = points;
    }

    if (totalPoints) {
        totalPoints.textContent = points;
    }
}

function loadWeeklyUsage() {
    const weeklyUsage = document.getElementById("weekly-usage");
    const weeklyValue = 0;

    if (weeklyUsage) {
        weeklyUsage.textContent = weeklyValue;
    }
}

function loadMonthlyUsage() {
    const monthlyUsage = document.getElementById("monthly-usage");
    const monthlyValue = 0;

    if (monthlyUsage) {
        monthlyUsage.textContent = monthlyValue;
    }
}