const API_BASE_URL = "https://dummyjson.com";

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = localStorage.getItem("username");
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("username").textContent = `Welcome, ${user}!`;
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("username");
    window.location.href = "index.html";
  });

  const recipesContainer = document.getElementById("recipesContainer");
  const searchInput = document.getElementById("searchInput");
  const cuisineFilter = document.getElementById("cuisineFilter");
  const showMoreBtn = document.getElementById("showMoreBtn");
  const loadingIndicator = document.getElementById("loading");

  let allRecipes = [];
  let displayedRecipes = [];
  let displayed = 0;
  let skip = 0;
  const limit = 5;
  let currentQuery = null;
  let hasMore = true;

  function setLoading(isLoading) {
    if (loadingIndicator) loadingIndicator.style.display = isLoading ? 'block' : 'none';
  }

  function showError(message) {
    recipesContainer.innerHTML = `<div class="error">Error: ${message}</div>`;
  }

  async function showProductDetails(recipeId) {
    try {
      const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const recipe = await res.json();
      alert(`Recipe: ${recipe.name}\n\nIngredients:\n- ${recipe.ingredients.join("\n- ")}\n\nInstructions:\n${recipe.instructions}`);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to load recipe details. Please try again later.");
    }
  }
  // Expose to global scope for inline onclick
  window.showProductDetails = showProductDetails;

  async function fetchRecipes(query = null, reset = true) {
    if (reset) {
      allRecipes = [];
      skip = 0;
      hasMore = true;
      displayedRecipes = [];
      recipesContainer.innerHTML = '';
    }

    setLoading(true);
    try {
      currentQuery = query;
      let url = `${API_BASE_URL}/recipes?limit=${limit}&skip=${skip}`;
      if (query) {
        url = `${API_BASE_URL}/recipes/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      const newRecipes = Array.isArray(data.recipes) ? data.recipes : [];
      allRecipes = [...allRecipes, ...newRecipes];
      
      if (newRecipes.length < limit) {
        hasMore = false;
      }
      
      skip += limit;
      renderRecipes();
    } catch (error) {
      console.error("Fetch error:", error);
      showError("Failed to load recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function renderRecipes() {
    const fragment = document.createDocumentFragment();
    
    allRecipes.forEach(r => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      card.innerHTML = `
        <img src="${r.image}" alt="${r.name}" onerror="this.src='placeholder.jpg';">
        <div class="card-content">
          <h3>${r.name}</h3>
          <div class="details">
            <span>🕒 ${r.prepTimeMinutes} mins</span>
            <span>⭐ ${r.rating}</span>
          </div>
          <p class="ingredients"><b>Ingredients:</b> ${r.ingredients.slice(0, 4).join(", ")}...</p>
        </div>
        <button onclick="showProductDetails(${r.id})">View Full Recipe</button>
      `;
      fragment.appendChild(card);
    });

    recipesContainer.appendChild(fragment);
    showMoreBtn.style.display = hasMore ? 'block' : 'none';
  }

  const debouncedSearch = debounce(() => {
    const query = searchInput.value.trim();
    if (query) {
      fetchRecipes(query, true);
    } else {
      fetchRecipes(null, true);
    }
  }, 500);

  searchInput.addEventListener("input", debouncedSearch);

  cuisineFilter.addEventListener("change", () => {
    fetchRecipes(currentQuery, true);
  });

  showMoreBtn.addEventListener("click", () => {
    fetchRecipes(currentQuery, false);
  });

  await fetchRecipes();
});