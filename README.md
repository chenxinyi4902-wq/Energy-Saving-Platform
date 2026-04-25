# Ecopulse - Energy Saving Platform

## Project Status

* The core frontend and backend codebase of the Energy Saving Platform has been completed. Main pages, API routes, data storage, and frontend-backend integration are fully implemented in the current version.

* The test-merge branch is used as the final testing environment for feature validation, logic checking, UI adjustments, and pre-release optimisation before merging into the main branch.

## File Structure

* `backend.py`  
  Main Flask backend file.

* `templates/`  
  Includes `login.html`, `index.html`, `history.html`, `leaderboard.html`, and `redeem.html`.

* `static/style.css`

* `static/js/`  
  Includes `login.js`, `index.js`, `history.js`, `leaderboard.js`, `redeem.js`, and `logout.js`.

## Iteration Info

### Iteration 1 - Added user data and leaderboard APIs
* The `/user-data` endpoint now provides user profile data and energy records for history and usage trend display.
* The `/leaderboard-data` endpoint returns ranked leaderboard data for the dashboard preview and leaderboard page.

---
### Iteration 2 - Updated frontend target display and fixed backend data reset
* Updated both frontend display logic and backend data handling.
* Improved target text/display behaviour, refreshed page data flow after login, and fixed backend demo data loading and reset logic.

---
### Iteration 3 - Updated monthly progress and points logic
* Refactored the backend settlement and prediction logic.
* Added automatic demo point settlement for completed billing periods on login.
* Updated dashboard data fields and removed old prorated progress logic.
* Synced `index.html` and `index.js` with the new monthly target, predicted usage, and estimated points display.

---
### Iteration 4 - Add logout feature and improve page consistency
* Added a logout feature to make switching between test accounts easier.
* Unified the header display across the main pages for a more consistent user experience.
* Improved the testing flow by allowing users to return to the login page more directly.

---
### Iteration 5 - Redemption Module Refinement
* Added a separate Current Points display on the redemption page while keeping Total Points unchanged for leaderboard ranking.
* Updated the redemption page layout with a cleaner points section and a View History entry.
* Improved the redemption logic for the testing version so current points and redemption records can be handled during a session.
* Kept the reset-on-logout mechanism for demo testing consistency.

---
### Iteration 6 - Refined Redemption and Page Text Logic
* Separated Current Points from Total Points in the redemption-related display logic.
* Refined the redemption page structure and interaction flow for the testing version.
* Improved text logic and display consistency on the history and leaderboard pages.

---
### Iteration 7 - Enhance dashboard styles for redemption features
* Added comprehensive styles for the redeem page in `style.css`, strictly scoped under `body.dashboard` to prevent contaminating the login page.
* Implemented the responsive `redemption-grid` and applied the project's unified Neobrutalism style, including white backgrounds, black borders, `9px` offset hard shadows, and hover floating effects.
* Added multi-dimensional state styles to the redeem button (`redeem-action-btn` — green for redeemable, gray for unredeemable, black background for loading), as well as color feedback for success/error message boxes.
* Completed the refined layout for the full-screen semi-transparent overlay (`modal-overlay`) and the centered history modal (`modal-box`).

---
### Iteration 8 - JavaScript Dynamic Rendering Refactoring & CSS Interface Integration 
* Removed hardcoded `style="..."` inline styles from `redeem.js` that were used for generating cards and history records.
* Accurately aligned with CSS interfaces within the JS DOM rendering logic. Added standard class names to dynamically generated elements.
* Added ternary operator logic so buttons automatically attach the `can-redeem` or `cannot-redeem` class upon rendering based on the user's current points.

---
### Iteration 9 - Refactor redeem toolbar and modal structure
* Updated key anchors like `<span id="current-points">` and `view-history-btn` to ensure JS can fetch the elements correctly.
* Moved the HTML skeleton of the history modal from inside `<main>` to the outermost layer just before `</body>`. This change avoids Z-index context pollution from parent containers and prevents potential bugs where `position: fixed` might fail.

---
### Iteration 13 - Dashboard Layout Refinement
* Reworked the dashboard layout with a clearer two-column structure.
* Moved Community Leaderboard under Daily Input and Points Redemption under Quick Statistics.
* Adjusted dashboard card sizing, spacing, and typography for better visual balance.
* Updated related HTML, CSS, and JavaScript to match the new dashboard layout.

---
### Iteration 14 - Redemption UI and Cycle Settlement Logic
* Updated the Points Redemption page layout by removing unnecessary loading/default messages and reducing extra spacing.
* Improved the Current Points display style to make the balance area clearer.
* Fixed backend cycle settlement logic so completed monthly cycles are automatically settled.

---
### Iteration 15 - Fix Cycle Settlement and Data Stability
* Improved the Current Points display to make the balance area clearer.
* Fixed monthly cycle settlement so completed cycles are settled automatically and the next cycle starts correctly.
* Improved `data.json` saving/loading stability to prevent empty-file read errors during page switching.

---
### Iteration16 - Add class to monthly target input field
* Add class to monthly target input field

---
### Iteration 17- History and leaderboard page styling
* Applied Neobrutalist styling (thick borders, lime headers, Outfit font) to .history-table.
* Added a lime-green hover effect for better readability.
* Used dashed borders for .empty-row to match dashboard placeholders.
* Aligned user info using Flexbox and added a brand-colored badge for the username.

---
### Iteration 18 - Backend Cycle Logic Refinement
* Updated leaderboard energy usage to follow each user's billing cycle.
* Improved cycle-based weekly and monthly usage consistency.
* Added automatic cycle start setup for new users after setting a target.
