document.addEventListener("DOMContentLoaded", () => {
    bindLogoutButton();
});

function bindLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {
        logoutBtn.disabled = true;

        try {
            const response = await fetch("/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Logout failed");
            }

            localStorage.removeItem("currentUser");
            localStorage.removeItem("username");
            window.location.href = "/";
        } catch (error) {
            alert(error.message || "Logout failed. Please try again.");
            logoutBtn.disabled = false;
        }
    });
}