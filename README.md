# Ecopulse - Energy Saving Platform

## Project Status

* The core frontend and backend codebase of the Energy Saving Platform has been completed. Main pages, API routes, data storage, and frontend-backend integration are now available in the current version.

* The following iterations are testing-based updates built on this completed structure. They are mainly used to check functionality, improve integration, and prepare the project for further optimisation and extension.

---
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