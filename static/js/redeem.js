const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    window.location.href = "/";
}

let currentPoints = 0;
let totalPoints = 0;

const rewardData = [
    {
        reward_id: "tesco_voucher",
        name: "Tesco £5 Voucher",
        points_required: 500,
        description: "Redeem a Tesco voucher for grocery shopping."
    },
    {
        reward_id: "cinema_ticket",
        name: "Cinema Ticket",
        points_required: 800,
        description: "Redeem one cinema ticket for entertainment."
    },
    {
        reward_id: "coffee_coupon",
        name: "Coffee Coupon",
        points_required: 300,
        description: "Redeem a coffee coupon at selected cafés."
    },
    {
        reward_id: "amazon_gift_card",
        name: "Amazon £10 Gift Card",
        points_required: 1000,
        description: "Redeem a digital gift card for online shopping."
    },
    {
        reward_id: "meal_deal_voucher",
        name: "Meal Deal Voucher",
        points_required: 450,
        description: "Redeem a meal deal voucher for food and drinks."
    },
    {
        reward_id: "campus_discount",
        name: "Campus Store Discount",
        points_required: 600,
        description: "Redeem a discount voucher for the campus store."
    },
    {
        reward_id: "bubble_tea_coupon",
        name: "Bubble Tea Coupon",
        points_required: 350,
        description: "Redeem a bubble tea coupon at selected partner stores."
    },
    {
        reward_id: "bookstore_voucher",
        name: "Bookstore Voucher",
        points_required: 700,
        description: "Redeem a voucher for books and stationery."
    },
    {
        reward_id: "eco_bottle",
        name: "Eco Bottle",
        points_required: 550,
        description: "Redeem a reusable eco-friendly water bottle."
    },
    {
        reward_id: "desk_lamp",
        name: "LED Desk Lamp",
        points_required: 900,
        description: "Redeem an LED desk lamp for study or work use."
    }
];

document.addEventListener("DOMContentLoaded", () => {
    initializeRedemptionPage();
});

function initializeRedemptionPage() {
    updateGreeting();
    updateUsername();
    renderRewardCards();
    bindRedeemGrid();
    bindHistoryModal();
    loadUserPoints();
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

function loadUserPoints() {
    const currentPointsElement = document.getElementById("current-points");
    const sidebarPoints = document.getElementById("sidebar-points");

    if (!currentPointsElement) {
        return;
    }

    fetch(`/energy-summary?username=${encodeURIComponent(currentUser)}`)
        .then(response => response.json())
        .then(data => {
            currentPoints = Number(data.current_points) || 0;
            totalPoints = Number(data.total_points) || 0;

            if (currentPointsElement) {
                currentPointsElement.textContent = currentPoints;
                }

            if (sidebarPoints) {
                sidebarPoints.textContent = currentPoints;
            }

            renderRewardCards();
            updateRedemptionMessage("Choose a reward to redeem with your current points.");
        })
        .catch(error => {
            console.error("Error loading points:", error);
            currentPoints = 0;
            totalPoints = 0;

            if (currentPointsElement) {
                currentPointsElement.textContent = "0";
                }

            if (sidebarPoints) {
                sidebarPoints.textContent = "0";
            }

            renderRewardCards();
            updateRedemptionMessage("Unable to load points. Rewards are shown in preview mode.");
        });
}

function renderRewardCards() {
    const redemptionGrid = document.getElementById("redemption-grid");

    if (!redemptionGrid) {
        return;
    }

    redemptionGrid.innerHTML = "";

    if (!Array.isArray(rewardData) || rewardData.length === 0) {
        redemptionGrid.innerHTML = `
            <p>No rewards are available right now.</p>
        `;
        return;
    }

    rewardData.forEach(reward => {
        const rewardName = reward.name ?? "Unnamed Reward";
        const rewardId = reward.reward_id ?? "";
        const requiredPoints = Number(reward.points_required) || 0;
        const rewardDescription = reward.description ?? "No description available.";
        const canRedeem = currentPoints >= requiredPoints;

        const rewardCard = document.createElement("div");
        rewardCard.className = "reward-card";

        rewardCard.innerHTML = `
            <div class="reward-name">${reward.name}</div>
            <div class="reward-points">Required Points: <span>${requiredPoints}</span></div>
            <div class="reward-description">${rewardDescription}</div>
            <button
                class="redeem-action-btn ${canRedeem ? 'can-redeem' : 'cannot-redeem'}"
                data-reward-id="${rewardId}"
                data-reward-name="${rewardName}"
                data-points-required="${requiredPoints}"
                ${canRedeem ? "" : "disabled"}
            >
                ${canRedeem ? "Redeem" : "Not Enough Points"}
            </button>
       `;

        redemptionGrid.appendChild(rewardCard);
    });
}

function bindRedeemGrid() {
    const redemptionGrid = document.getElementById("redemption-grid");

    if (!redemptionGrid) {
        return;
    }

    redemptionGrid.addEventListener("click", event => {
        const button = event.target.closest(".redeem-action-btn");

        if (!button) {
            return;
        }

        const rewardName = button.dataset.rewardName || "this reward";
        const pointsRequired = Number(button.dataset.pointsRequired) || 0;

        if (currentPoints < pointsRequired) {
            updateRedemptionMessage(`You do not have enough points to redeem ${rewardName}.`);
            return;
        }

        handleRewardRedemption(button, rewardName, pointsRequired);
    });
}

function handleRewardRedemption(button, rewardName, pointsRequired) {
    if (!button) return;

    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Redeeming...";

    fetch("/redeem-reward", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: currentUser,
            reward_name: rewardName,
            points_required: pointsRequired
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentPoints = Number(data.remaining_points) || 0;

                const currentPointsElement = document.getElementById("current-points");
                if (currentPointsElement) {
                    currentPointsElement.textContent = currentPoints;
                }
                const sidebarPoints = document.getElementById("sidebar-points");
                if (sidebarPoints) {
                    sidebarPoints.textContent = currentPoints;
                }

                updateRedemptionMessage(data.message || `Successfully redeemed ${rewardName}.`);
                renderRewardCards();
            } else {
                updateRedemptionMessage(data.message || `Failed to redeem ${rewardName}.`);
                button.disabled = false;
                button.textContent = originalText;
            }
        })
        .catch(error => {
            console.error("Error redeeming reward:", error);
            updateRedemptionMessage("Something went wrong while redeeming this reward.");
            button.disabled = false;
            button.textContent = originalText;
        });
}

// ================= HISTORY MODAL =================
function bindHistoryModal() {
    const viewHistoryBtn = document.getElementById("view-history-btn");
    const closeHistoryBtn = document.getElementById("close-history-btn");
    const closeIconBtn = document.getElementById("history-close-icon");
    const historyOverlay = document.getElementById("history-overlay");

    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener("click", openHistoryModal);
    }

    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener("click", closeHistoryModal);
    }

    if (closeIconBtn) {
        closeIconBtn.addEventListener("click", closeHistoryModal);
    }

    if (historyOverlay) {
        historyOverlay.addEventListener("click", closeHistoryModal);
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeHistoryModal();
        }
    });
}

function openHistoryModal() {
    const historyOverlay = document.getElementById("history-overlay");
    const historyModal = document.getElementById("history-modal");

    renderHistoryList();

    if (historyOverlay) {
        historyOverlay.classList.remove("hidden");
    }

    if (historyModal) {
        historyModal.classList.remove("hidden");
    }
}

function closeHistoryModal() {
    const historyOverlay = document.getElementById("history-overlay");
    const historyModal = document.getElementById("history-modal");

    if (historyOverlay) {
        historyOverlay.classList.add("hidden");
    }

    if (historyModal) {
        historyModal.classList.add("hidden");
    }
}

function renderHistoryList() {
    const historyList = document.getElementById("history-list");

    if (!historyList) return;

    fetch(`/redemption-history?username=${encodeURIComponent(currentUser)}`)
        .then(response => response.json())
        .then(data => {
            const history = Array.isArray(data.history) ? data.history : [];

            if (history.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-state">
                        <p>No redemption history yet.</p>
                    </div>
                `;
                return;
            }

            historyList.innerHTML = history.map(record => `
                <div class="history-item">
                    <div>
                        <p class="reward-title">${record.reward_name}</p>
                        <p class="reward-date">${record.redeemed_at}</p>
                    </div>
                    <span class="points-spent">-${record.points_spent || record.points || '???'} PTS</span>
                </div>
            `).join("");
        })
        .catch(error => {
            console.error("Error loading redemption history:", error);
            historyList.innerHTML = `
                <p style="text-align: center; margin: 0;">
                    Unable to load redemption history.
                </p>
            `;
        });
}

function updateRedemptionMessage(message) {
    const redemptionMessage = document.getElementById("redemption-message");

    if (redemptionMessage) {
        redemptionMessage.textContent = message;
    }
}
