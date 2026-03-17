function login() {

let username = document.getElementById("username").value;
let password = document.getElementById("password").value;
let message = document.getElementById("message");

if(username === "" || password === ""){
message.innerText = "Please enter username and password";
return;
}

fetch("/login", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
username: username,
password: password
})
})
.then(response => response.json())
.then(data => {
message.innerText = data.message;
})
.catch(error => {
message.innerText = "Server error";
});

}
