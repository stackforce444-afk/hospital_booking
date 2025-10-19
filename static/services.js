/**
 * Swasthya Setu - Services Page JavaScript
 * Handles user registration functionality
 */

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");

  // Only run if register form exists on the page
  if (!registerForm) return;

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    // Basic validation
    if (!name || !email || !password || !role) {
      alert("Please fill in all fields.");
      return;
    }

    // Load existing users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check for duplicate email
    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
      alert("User with this email already exists.");
      return;
    }

    // Save new user
    const newUser = { name, email, password, role };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! Please log in.");
    window.location.href = "login.html";
  });
});
