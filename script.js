const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".carousel-dot");
const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");
const carousel = document.getElementById("shoeCarousel");
const API_URL = "https://dummyjson.com/products/category/womens-shoes";
const WHATSAPP_NUMBER = "573168244759";

const productsGrid = document.getElementById("productsGrid");
const productsLoading = document.getElementById("productsLoading");
const productsError = document.getElementById("productsError");
const reloadProducts = document.getElementById("reloadProducts");

let currentSlide = 0;
let autoPlay;


menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("active");

  if (mobileMenu.classList.contains("active")) {
    menuBtn.textContent = "✕";
  } else {
    menuBtn.textContent = "☰";
  }
});

const dropdownButtons = document.querySelectorAll(".mobile-dropdown-btn");

dropdownButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const dropdown = button.nextElementSibling;
    dropdown.classList.toggle("active");
  });
});


function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide) => {
    slide.classList.remove("active");
  });

  dots.forEach((dot) => {
    dot.classList.remove("active");
  });

  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function startAutoPlay() {
  autoPlay = setInterval(nextSlide, 7000);
}

function stopAutoPlay() {
  clearInterval(autoPlay);
}

nextBtn.addEventListener("click", () => {
  nextSlide();
  stopAutoPlay();
  startAutoPlay();
});

prevBtn.addEventListener("click", () => {
  prevSlide();
  stopAutoPlay();
  startAutoPlay();
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const index = Number(dot.dataset.slide);
    showSlide(index);
    stopAutoPlay();
    startAutoPlay();
  });
});

carousel.addEventListener("mouseenter", stopAutoPlay);
carousel.addEventListener("mouseleave", startAutoPlay);

startAutoPlay();


function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}

function createWhatsAppLink(productName, price) {
  const message = `Hola, quiero más información sobre este zapato: ${productName}. Precio: ${formatCOP(price)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function calculatePrices(product) {
  const dollarToCOP = 4000;

  const finalPrice = Math.round(product.price * dollarToCOP);
  const discount = product.discountPercentage || 15;
  const oldPrice = Math.round(finalPrice / (1 - discount / 100));

  return {
    finalPrice,
    oldPrice,
    discount: Math.round(discount)
  };
}

function renderProducts(products) {
  productsGrid.innerHTML = "";

  products.forEach((product) => {
    const { finalPrice, oldPrice, discount } = calculatePrices(product);

    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image-box">
        <span class="discount-badge">-${discount}%</span>

        <img 
          src="${product.thumbnail}" 
          alt="${product.title}" 
          class="product-image"
        />
        
        <div class="product-overlay">
          <p>${product.description}</p>
        </div>

        <button class="favorite-btn" type="button" aria-label="Agregar a favoritos">
          ♡
        </button>
      </div>

      <div class="px-3 pb-5">
        <h3 class="product-title">
          ${product.title}
        </h3>

        <div class="flex items-center justify-center gap-3 mt-3">
          <span class="price-old">
            ${formatCOP(oldPrice)}
          </span>

          <span class="price-new">
            ${formatCOP(finalPrice)}
          </span>
        </div>

        <a 
          href="${createWhatsAppLink(product.title, finalPrice)}"
          target="_blank"
          rel="noopener noreferrer"
          class="buy-btn inline-flex justify-center"
        >
          Comprar por WhatsApp
        </a>
      </div>
    `;

    const favoriteBtn = card.querySelector(".favorite-btn");

    favoriteBtn.addEventListener("click", () => {
      favoriteBtn.classList.toggle("active");
      favoriteBtn.textContent = favoriteBtn.classList.contains("active") ? "♥️" : "♡";
    });

    productsGrid.appendChild(card);
  });
}

async function getProducts() {
  try {
    productsLoading.classList.remove("hidden");
    productsError.classList.add("hidden");
    productsGrid.innerHTML = "";

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Error al consumir la API");
    }

    const data = await response.json();

    renderProducts(data.products);
  } catch (error) {
    console.error(error);
    productsError.classList.remove("hidden");
  } finally {
    productsLoading.classList.add("hidden");
  }
}



reloadProducts?.addEventListener("click", getProducts);

getProducts();

let selectedRating = 0;

const stars = document.querySelectorAll(".star");
const submitReview = document.getElementById("submitReview");
const reviewText = document.getElementById("reviewText");
const reviewsContainer = document.getElementById("reviewsContainer");

stars.forEach((star) => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);

    stars.forEach((s) => {
      s.classList.remove("active");
    });

    for (let i = 0; i < selectedRating; i++) {
      stars[i].classList.add("active");
    }
  });
});

function loadReviews() {
  const reviews =
    JSON.parse(localStorage.getItem("reviews")) || [];

  reviewsContainer.innerHTML = "";

  reviews.reverse().forEach((review) => {
    const card = document.createElement("div");

    card.className = "review-card";

    card.innerHTML = `
      <div class="review-stars">
        ${"★".repeat(review.rating)}
      </div>

      <p>${review.text}</p>
    `;

    reviewsContainer.appendChild(card);
  });
}

submitReview.addEventListener("click", () => {
  const text = reviewText.value.trim();

  if (!text) {
    alert("Escribe una reseña");
    return;
  }

  if (selectedRating === 0) {
    alert("Selecciona una calificación");
    return;
  }

  const reviews =
    JSON.parse(localStorage.getItem("reviews")) || [];

  reviews.push({
    rating: selectedRating,
    text: text
  });

  localStorage.setItem(
    "reviews",
    JSON.stringify(reviews)
  );

  reviewText.value = "";
  selectedRating = 0;

  stars.forEach((star) => {
    star.classList.remove("active");
  });

  loadReviews();
});

loadReviews();