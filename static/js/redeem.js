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
            currentPointsEarned = data.points_earned ?? 0;
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

    rewardData.forEach(reward => {
        const canRedeem = currentPointsEarned >= reward.points_required;

        const rewardCard = document.createElement("div");
        rewardCard.className = "reward-card";

        rewardCard.innerHTML = `
            <h4>${reward.name}</h4>
            <p><strong>Required Points:</strong> ${reward.points_required}</p>
            <p>${reward.description}</p>
            <button
                class="redeem-action-btn"
                data-reward-id="${reward.reward_id}"
                data-reward-name="${reward.name}"
                data-points-required="${reward.points_required}"
                ${canRedeem ? "" : "disabled"}
            >
                ${canRedeem ? "Redeem" : "Not Enough Points"}
            </button>
        `;

        redemptionGrid.appendChild(rewardCard);
    });

    bindRedeemButtons();
}

function bindRedeemButtons() {
    const redeemButtons = document.querySelectorAll(".redeem-action-btn");

    redeemButtons.forEach(button => {
        button.addEventListener("click", () => {
            const rewardName = button.dataset.rewardName;
            const pointsRequired = Number(button.dataset.pointsRequired);

            if (currentPointsEarned < pointsRequired) {
                updateRedemptionMessage(`You do not have enough points to redeem ${rewardName}.`);
                return;
            }

            updateRedemptionMessage(
                `${rewardName} is ready for redemption. Backend redemption logic will be connected in a later iteration.`
            );
        });
    });
}

function updateRedemptionMessage(message) {
    const redemptionMessage = document.getElementById("redemption-message");

    if (redemptionMessage) {
        redemptionMessage.textContent = message;
    }
}