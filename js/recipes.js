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

  const modal = document.getElementById("recipeModal");
  const closeBtn = document.getElementById("closeModal");

  let allRecipes = [];
  let filteredRecipes = [];
  let displayed = 0;
  const perPage = 8;
  let isSearching = false;

  function setLoading(isLoading) {
    // optional: implement loading indicator if ada
  }

  function showError(message) {
    recipesContainer.innerHTML = `<div class="error">Error: ${message}</div>`;
  }

  async function fetchRecipes(query = null) {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/recipes?limit=100`;
      if (query) {
        url = `${API_BASE_URL}/recipes/search?q=${encodeURIComponent(query)}`;
        isSearching = true;
      } else {
        isSearching = false;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      allRecipes = data.recipes || [];

      if (!isSearching) populateCuisineFilter();

      applyFilters();
    } catch (error) {
      console.error("Fetch error:", error);
      showError("Failed to load recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function populateCuisineFilter() {
    cuisineFilter.innerHTML = '<option value="">All Cuisines</option>';
    const cuisines = [...new Set(allRecipes.map(r => r.cuisine))].filter(Boolean);
    cuisines.forEach(cuisine => {
      const opt = document.createElement("option");
      opt.value = cuisine;
      opt.textContent = cuisine;
      cuisineFilter.appendChild(opt);
    });
  }

  function applyFilters() {
    const cuisine = cuisineFilter.value;
    const query = searchInput.value.toLowerCase().trim();

    // Filter berdasarkan search query dan cuisine
    filteredRecipes = allRecipes.filter(recipe => {
      // Cek apakah cocok dengan search query
      const matchesSearch = !query || 
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(query)) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (recipe.cuisine && recipe.cuisine.toLowerCase().includes(query));

      // Cek apakah cocok dengan cuisine filter
      const matchesCuisine = !cuisine || recipe.cuisine === cuisine;

      return matchesSearch && matchesCuisine;
    });

    displayed = 0;
    renderRecipes(true);
  }

  function openModal(recipe) {
    modal.style.display = "flex";
    modal.querySelector("h2").textContent = recipe.name;
    modal.querySelector(".modal-content img").src = recipe.image || 'placeholder.jpg';
    modal.querySelector(".recipe-info").innerHTML = `
      <div><strong>PREP TIME</strong><br>${recipe.prepTimeMinutes || 0} mins</div>
      <div><strong>COOK TIME</strong><br>${recipe.cookTimeMinutes || 0} mins</div>
      <div><strong>SERVINGS</strong><br>${recipe.servings || 4}</div>
      <div><strong>DIFFICULTY</strong><br>${recipe.difficulty || 'Medium'}</div>
      <div><strong>CUISINE</strong><br>${recipe.cuisine || 'Unknown'}</div>
      <div><strong>CALORIES</strong><br>${recipe.calories || 0} cal/serving</div>
    `;
    modal.querySelector(".rating").textContent = `⭐ ${recipe.rating || 0} — ${recipe.reviews || 0} reviews`;
    modal.querySelector(".tags").innerHTML = recipe.tags?.map(t => `<span>${t}</span>`).join(" ") || "";
    modal.querySelector("ul").innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join("");
    modal.querySelector("ol").innerHTML = recipe.instructions?.map(i => `<li>${i}</li>`).join("") || "";
  }

  closeBtn.addEventListener("click", () => { modal.style.display = "none"; });
  window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

  function renderRecipes(reset = false) {
    if (reset) {
      recipesContainer.innerHTML = '';
      displayed = 0;
    }

    const toRender = filteredRecipes.slice(0, displayed + perPage);

    if (toRender.length === 0 && displayed === 0) {
      recipesContainer.innerHTML = `<div class="no-results">No recipes found.</div>`;
      showMoreBtn.style.display = 'none';
      return;
    }

    const fragment = document.createDocumentFragment();
    toRender.slice(displayed).forEach(r => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      card.innerHTML = `
        <img src="${r.image}" alt="${r.name}" onerror="this.src='placeholder.jpg';">
        <div class="card-content">
          <h3>${r.name}</h3>
          <div class="details">
            <span>🕒 ${r.prepTimeMinutes || 0} mins</span>
            <span>⭐ ${r.rating || 0}</span>
          </div>
          <p class="ingredients"><b>Ingredients:</b> ${r.ingredients.slice(0, 4).join(", ")}...</p>
        </div>
        <button class="view-recipe-btn">View Full Recipe</button>
      `;
      card.querySelector(".view-recipe-btn").addEventListener("click", () => openModal(r));
      fragment.appendChild(card);
    });

    recipesContainer.appendChild(fragment);
    displayed = toRender.length;
    showMoreBtn.style.display = filteredRecipes.length > displayed ? 'block' : 'none';
  }

  // Ganti debouncedSearch untuk menggunakan applyFilters saja
  const debouncedSearch = debounce(applyFilters, 500);
  
  searchInput.addEventListener("input", debouncedSearch);
  cuisineFilter.addEventListener("change", applyFilters);
  showMoreBtn.addEventListener("click", () => renderRecipes(false));

  await fetchRecipes();
});