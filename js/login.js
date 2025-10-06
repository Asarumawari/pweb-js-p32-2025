document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("message");
  const loginBtn = document.getElementById("loginBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    message.textContent = "";
    message.style.color = "#333";

    if (!username || !password) {
      message.textContent = "Isi semua field terlebih dahulu.";
      message.style.color = "red";
      return;
    }

    loginBtn.disabled = true;
    message.innerHTML = `Sedang memeriksa <span class="loading"></span>`;

    try {
      const res = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login gagal!");
      }

      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("token", data.token);

      message.style.color = "green";
      message.textContent = `Selamat datang, ${data.firstName}!`;

      console.log("Login berhasil:", data);

      /*
      setTimeout(() => {
        window.location.href = "recipes.html";
      }, 1000);
      */

    } catch (error) {
      message.style.color = "red";
      message.textContent = error.message || "Terjadi kesalahan saat login.";
      console.error(error);
    } finally {
      loginBtn.disabled = false;
    }
  });
});
