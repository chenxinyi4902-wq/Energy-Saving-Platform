# Ecopulse - Energy Saving Platform

## Current Progress

* Completed the login page user interface
* Implemented frontend using HTML, CSS, and JavaScript
* Successfully integrated login functionality with backend locally
* User authentication is working in a local environment
* Implemented redirection to main interface (`/index`) after successful login

## Features (Login Module)

* User login with username and password
* Frontend-backend communication for authentication
* Structured layout ready for future navigation (e.g., dashboard)

## Features (Main Interface)

* Header with platform title and user greeting placeholder
* Sidebar navigation for:
  - Dashboard
  - Electricity Usage History
  - Community Leaderboard
  - Points Redemption
* Clickable dashboard sections for quick access to:
  - Electricity Usage History
  - Community Leaderboard
  - Points Redemption
* Total points display section

## Technologies Used

* HTML5
* CSS3
* JavaScript
* Python (Flask – backend, local development only)

## File Structure

/frontend
│── templates/
│   └── login.html
│   └── index.html
│── static/
│   ├── style.css
│   └── script.js

## Future Improvements

* Implement full dashboard functionality (data integration)
* Connect sidebar navigation to different pages/modules
* Improve UI/UX with enhanced styling
* Add form validation and error handling
* Upload complete backend code in future iterations

## ⚠️ Important Usage Note

This application must be accessed through the Flask development server.


## Iteration Info

### Iteration 1 - Create Basic HTML Skeleton

* Created initial `login.html` structure
* Added basic HTML5 document setup (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)
* Defined page title

---

### Iteration 2 - Add Login Form Structure

* Added main heading: *Energy Saving Platform*
* Added login section title
* Created login form
* Added input fields for username and password
* Added login button

---

### Iteration 3 - Add IDs and Connect JavaScript

* Added `id` attributes to input fields (`username`, `password`)
* Added `onclick` event to login button (`login()` function)
* Added `<script>` to link external JavaScript file (`script.js`)
* Added message display area (`<p id="message">`)

---

### Iteration 4 - Create JavaScript Login Function

* Created `script.js` file
* Implemented `login()` function
* Retrieved user input using `getElementById`
* Added validation for empty username and password
* Displayed basic feedback message when button is clicked

---

### Iteration 5 - Add CSS Styling

* Created `style.css` file
* Applied layout using Flexbox to center content
* Styled login form with card-style design (padding, border-radius, shadow)
* Styled input fields and buttons
* Added hover and focus effects
* Improved overall user interface

---

### Iteration 6 - Add CSS Link and Fix Static File Paths

* Linked CSS file using `/static/style.css`
* Linked JavaScript file using `/static/script.js`
* Fixed issue with incorrect or duplicate script paths
* Ensured static files load correctly in Flask environment

---

### Iteration 7 - Improve JavaScript and Add Backend Communication

* Refactored `login()` function using variables (e.g., `message`)
* Removed redundant DOM operations
* Implemented `fetch()` API to send POST request to `/login`
* Sent username and password as JSON data
* Processed backend response and displayed message dynamically
* Added error handling for server issues

> Note: Backend integration has been implemented locally using Flask.
> The application requires running the Flask server to enable full functionality.

---

### Iteration 8 - Header and Sidebar Structure

* Created the basic HTML structure for the header and sidebar in index.html. 
* The sidebar includes navigation items for main features, and a total points section is added at the bottom. 
Dynamic functionality will be implemented in future iterations.

---

### Iteration 9 - Revamp CSS for Improved Design
* Implemented bold borders (3px), heavy shadows (12px), and a dot-grid background.
* Enhanced Visuals: Integrated Space Grotesk and Outfit fonts with a high-contrast Neon Green (#ccff00) theme.
* Added a custom @keyframes boing hover animation for the login button and focus effects for inputs.

---

### Iteration 10 - Update HTML Structure & Assets
* Wrapped content in a .brutal-card container for a stable, centered UI.
* Rebranded as "Ecopulse" with a tilted CSS effect and integrated Lucide Icons (zap).
* Added Tailwind CSS for layout utilities and used DOMContentLoaded to ensure safe script execution.

---

### Iteration 11 - Dashboard Structure Refinement

* Refined dashboard layout using semantic HTML
* Removed redundant "Dashboard" title
* Organized content into top and bottom sections
* Implemented 3-column structure:
  - Daily Input and Statistics (tall blocks)
  - Leaderboard and Points Redemption (stacked)
* Added comments and IDs for future CSS and JavaScript

---

### Iteration 12 - Navigation Structure

* Converted sidebar menu items into clickable navigation links using anchor tags  
* Created empty HTML pages for each core feature module (History, Leaderboard, Redemption)  
* Established a basic multi-page structure for the application

---

### Iteration 13 - Enhanced Navigation

* Improved navigation by making key dashboard sections clickable  
* Enabled direct access from dashboard to History, Leaderboard, and Redemption pages  
* Strengthened the dashboard as a central control hub for user interaction  
* Updated README to reflect the latest changes  

---

### Iteration 14 - Frontend-Backend Routing Fix

* Fixed issue where frontend could not communicate with backend when opened via local server (port 63342)
* Ensured all pages are rendered through Flask using `render_template`
* Added `/index` route to support post-login redirection
* Implemented conditional navigation after successful login
* Clarified correct application access method via Flask server
 
---

### Iteration 15 - Frontend Structure Preparation

* Added a basic input form to the dashboard as a placeholder for future user interaction  
* Introduced placeholder sections for **weekly** and **monthly energy usage** to support upcoming dynamic updates  
* Created a dedicated `static/js/` folder to organize JavaScript files  
* Initialized an empty `index.js` file for dashboard logic implementation in future iterations  
* Separated JavaScript files by functionality 
* Ensured each HTML page is paired with its corresponding JavaScript file to improve code organization and maintainability  

---

### Iteration 16 - Add class 'dashboard'

* Added class="dashboard" to <body> in index.html to activate dashboard styles

---

### Iteration 17 - Add class 'login'

* Add class 'login' to body element

---

### Iteration 18 - Refactor CSS for login and dashboard styles

* Merged style.css (login) and dashboard into a single stylesheet
* Scoped all login styles under body.login and all dashboard styles under body.dashboard to prevent conflicts
* No visual changes — layout, colours, and typography remain identical to previous iteration

---

### Iteration 19 - Refactor header and sidebar sections in index
* Restructured sidebar navigation from plain `<ul><li>` list to styled `<div class="nav-item">` elements with Lucide icons
* Moved `<header>` from top-level `<body>` into `<main>` to match sidebar + main layout
* Expanded header to include Current Balance display and user avatar
* Replaced nested `<section>` layout with flat stats-grid, mid-grid, action-grid divs
* Added CSS classes to all cards to connect with style.css; all original id values preserved

---

### Iteration 20 - Limit the webpage width and font display
* Set width: 1440px and margin: 0 auto on body.dashboard to cap page width and centre content
* Added max-width: 100% to prevent horizontal overflow on smaller screens
* Linked Google Fonts (Outfit + Space Grotesk) in <head> to ensure correct font rendering
* Fixed sidebar link colour and underline by adding text-decoration: none; color: inherit to body.dashboard aside nav a

---

### Iteration 21 - Add monthly target modal and initial dashboard logic
* Added a monthly target modal in `index.html`
* Updated the CSS link to match Flask static file routing
* Rebuilt `index.js` for the dashboard page
* Added dynamic greeting and username display in the header
* Added logic to check whether the current user has already set a monthly electricity target
* Forced the monthly target modal to appear if no target exists
* Added frontend validation and submission logic for target input
* Added basic daily usage form handling
* Added placeholder loading logic for points, weekly usage, and monthly usage

---

## Author

Xinyi Chen, Yiqun Liu
