const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    window.location.href = "/";
}

let currentTotalPoints = 0;

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
    }
];

document.addEventListener("DOMContentLoaded", () => {
    initializeRedemptionPage();
});

function initializeRedemptionPage() {
    renderRewardCards();
    bindRedeemGrid();
    loadUserPoints();
}

function loadUserPoints() {
    const pointsEarned = document.getElementById("points-earned");
    const sidebarPoints = document.getElementById("sidebar-points");

    if (!pointsEarned) {
        return;
    }

    fetch(`/energy-summary?username=${encodeURIComponent(currentUser)}`)
        .then(response => response.json())
        .then(data => {
            currentTotalPoints = Number(data.total_points) || 0;
            pointsEarned.textContent = currentTotalPoints;

            if (sidebarPoints) {
                sidebarPoints.textContent = currentTotalPoints;
            }

            renderRewardCards();
            updateRedemptionMessage("Rewards are displayed below. Locked items require more points.");
        })
        .catch(error => {
            console.error("Error loading points earned:", error);
            currentTotalPoints = 0;
            pointsEarned.textContent = "0";

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
        const canRedeem = currentTotalPoints >= requiredPoints;

        const rewardCard = document.createElement("div");
        rewardCard.className = "reward-card";

        rewardCard.innerHTML = `
            <h4>${reward.name}</h4>
            <p><strong>Required Points:</strong> ${requiredPoints}</p>
            <p>${rewardDescription}</p>
            <button
                class="redeem-action-btn"
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

        if (currentTotalPoints < pointsRequired) {
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
                currentTotalPoints = Number(data.remaining_points) || 0;

                const pointsEarned = document.getElementById("points-earned");
                const sidebarPoints = document.getElementById("sidebar-points");

                if (pointsEarned) {
                    pointsEarned.textContent = currentTotalPoints;
                }

                if (sidebarPoints) {
                    sidebarPoints.textContent = currentTotalPoints;
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

function updateRedemptionMessage(message) {
    const redemptionMessage = document.getElementById("redemption-message");

    if (redemptionMessage) {
        redemptionMessage.textContent = message;
    }
}