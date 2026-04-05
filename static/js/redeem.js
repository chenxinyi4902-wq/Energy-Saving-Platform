const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    window.location.href = "/";
}

let currentPointsEarned = 0;

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
    loadPointsEarned();
}

function loadPointsEarned() {
    const pointsEarned = document.getElementById("points-earned");

    if (!pointsEarned) {
        return;
    }

    fetch(`/energy-summary?username=${encodeURIComponent(currentUser)}`)
        .then(response => response.json())
        .then(data => {
            currentPointsEarned = Number(data.points_earned) || 0;
            pointsEarned.textContent = currentPointsEarned;

            renderRewardCards();
            updateRedemptionMessage("Rewards are displayed below. Locked items require more points.");
        })
        .catch(error => {
            console.error("Error loading points earned:", error);
            currentPointsEarned = 0;
            pointsEarned.textContent = "0";

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
        const canRedeem = currentPointsEarned >= requiredPoints;

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

        if (currentPointsEarned < pointsRequired) {
            updateRedemptionMessage(`You do not have enough points to redeem ${rewardName}.`);
            return;
        }

        updateRedemptionMessage(
            `${rewardName} is ready for redemption. Backend redemption logic will be connected in a later iteration.`
        );
    });
}

function updateRedemptionMessage(message) {
    const redemptionMessage = document.getElementById("redemption-message");

    if (redemptionMessage) {
        redemptionMessage.textContent = message;
    }
}