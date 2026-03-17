# Ecopulse - Energy Saving Platform

## Current Progress

* Completed the login page user interface
* Implemented frontend using HTML, CSS, and JavaScript
* Successfully integrated login functionality with backend locally
* User authentication is working in a local environment
* Frontend code has been uploaded to this repository

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

* Implement dashboard interface
* Add redirection after successful login
* Connect sidebar navigation to different pages/modules
* Improve UI/UX with enhanced styling
* Add form validation and error handling
* Upload complete backend code in future iterations

## Iteration Info

### Iteration 1: Create Basic HTML Skeleton

* Created initial `login.html` structure
* Added basic HTML5 document setup (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)
* Defined page title

---

### Iteration 2: Add Login Form Structure

* Added main heading: *Energy Saving Platform*
* Added login section title
* Created login form
* Added input fields for username and password
* Added login button

---

### Iteration 3: Add IDs and Connect JavaScript

* Added `id` attributes to input fields (`username`, `password`)
* Added `onclick` event to login button (`login()` function)
* Added `<script>` to link external JavaScript file (`script.js`)
* Added message display area (`<p id="message">`)

---

### Iteration 4: Create JavaScript Login Function

* Created `script.js` file
* Implemented `login()` function
* Retrieved user input using `getElementById`
* Added validation for empty username and password
* Displayed basic feedback message when button is clicked

---

### Iteration 5: Add CSS Styling

* Created `style.css` file
* Applied layout using Flexbox to center content
* Styled login form with card-style design (padding, border-radius, shadow)
* Styled input fields and buttons
* Added hover and focus effects
* Improved overall user interface

---

### Iteration 6: Add CSS Link and Fix Static File Paths

* Linked CSS file using `/static/style.css`
* Linked JavaScript file using `/static/script.js`
* Fixed issue with incorrect or duplicate script paths
* Ensured static files load correctly in Flask environment

---

### Iteration 7: Improve JavaScript and Add Backend Communication

* Refactored `login()` function using variables (e.g., `message`)
* Removed redundant DOM operations
* Implemented `fetch()` API to send POST request to `/login`
* Sent username and password as JSON data
* Processed backend response and displayed message dynamically
* Added error handling for server issues

> Note: Backend code is not included in this repository because it is still under development.
> Login functionality has been tested locally with a backend.

---

### Iteration 8: Header and Sidebar Structure

Created the basic HTML structure for the header and sidebar in index.html. 
The sidebar includes navigation items for main features, and a total points section is added at the bottom. 
Dynamic functionality will be implemented in future iterations.




## Author

Xinyi Chen, Yiqun Liu
