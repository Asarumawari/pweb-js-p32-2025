document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("message");
  const loginBtn = document.querySelector("button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    message.textContent = "";
    message.style.color = "#333";

    if (!username || !password) {
      message.textContent = "Oops! The username or password you entered is incorrect";
      message.style.color = "red";
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = `<div class="loading"></div>`;

    try {
      const res = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log(data);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      message.style.color = "green";
      message.textContent = `Welcome, ${data.firstName}!`;

      console.log("Login success:", data);

      setTimeout(() => {
        window.location.href = "recipes.html";
      }, 1000);

    } catch (error) {
      message.style.color = "red";
      message.textContent = error.message || "An error occurred during login";
      console.error(error);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });
});
