let PRODUCTS = [];

const CATEGORIES = {
  Mobiles: [
    "Smartphones",
    "Budget Smartphones",
    "Premium Smartphones",
    "Mobile Accessories",
  ],
  Laptops: [
    "Gaming Laptops",
    "Business Laptops",
    "Student Laptops",
    "Ultrabooks",
  ],
  Monitors: [
    "Gaming Monitors",
    "4K Monitors",
    "Office Monitors",
    "Ultrawide Monitors",
  ],
  TVs: ["LED TVs", "QLED TVs", "OLED TVs", "4K TVs"],
  "Home Appliances": [
    "Air Conditioners",
    "Refrigerators",
    "Washing Machines",
    "Air Purifiers",
    "Microwaves",
  ],
  Books: [
    "Fiction",
    "Non-Fiction",
    "Education & Learning",
    "Competitive Exams",
    "Children's Books",
  ],
  Fashion: [
    "Men's Fashion",
    "Women's Fashion",
    "Kids' Fashion",
    "Footwear",
    "Watches & Accessories",
  ],
  Beauty: ["Skincare", "Hair Care", "Makeup", "Fragrance", "Beauty Tools"],
};

// Product ID architecture: 101-199 Mobiles, 201-299 Laptops, etc.
const ID_RANGES = {
  Mobiles: [101, 199],
  Laptops: [201, 299],
  Monitors: [301, 399],
  TVs: [401, 499],
  "Home Appliances": [501, 599],
  Books: [601, 699],
  Fashion: [701, 799],
  Beauty: [801, 899],
};

const PRODUCT_PLACEHOLDER = "images/product-placeholder.svg";

function validateProducts(products) {
  if (!Array.isArray(products)) {
    throw new Error("products.json must contain a JSON array.");
  }

  const seenIds = new Set();

  products.forEach((product, index) => {
    const position = `products.json item ${index + 1}`;

    if (!product || typeof product !== "object") {
      throw new Error(`${position}: product must be an object.`);
    }

    // ID is mandatory, numeric, integer and unique.
    if (!Number.isInteger(product.id)) {
      throw new Error(`${position}: id is mandatory and must be an integer.`);
    }

    if (seenIds.has(product.id)) {
      throw new Error(
        `${position}: duplicate product id ${product.id}. IDs must be unique.`,
      );
    }

    seenIds.add(product.id);

    if (
      !product.category ||
      !Object.prototype.hasOwnProperty.call(ID_RANGES, product.category)
    ) {
      throw new Error(
        `${position}: category is missing or not configured in ID_RANGES.`,
      );
    }

    const [minId, maxId] = ID_RANGES[product.category];

    if (product.id < minId || product.id > maxId) {
      throw new Error(
        `${position}: id ${product.id} does not belong to ${product.category}. ` +
          `${product.category} IDs must be ${minId}-${maxId}.`,
      );
    }

    const requiredFields = [
      "name",
      "description",
      "image",
      "amazonLink",
      "subcategory",
    ];

    requiredFields.forEach((field) => {
      if (typeof product[field] !== "string" || !product[field].trim()) {
        throw new Error(`${position}: ${field} is required.`);
      }
    });
  });

  return products;
}

async function loadProducts() {
  if (PRODUCTS.length) return PRODUCTS;

  try {
    const response = await fetch("products.json");

    if (!response.ok) {
      throw new Error(`Failed to load products.json (${response.status}).`);
    }

    const data = await response.json();
    PRODUCTS = validateProducts(data);
  } catch (error) {
    console.error("KartGuru product data error:", error);
    PRODUCTS = [];
  }

  return PRODUCTS;
}

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (match) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[match],
  );
}

function categoryUrl(category, subcategory) {
  return `products.html?category=${encodeURIComponent(category)}${subcategory ? `&subcategory=${encodeURIComponent(subcategory)}` : ""}`;
}

function productUrl(product) {
  return `product.html?id=${encodeURIComponent(product.id)}`;
}

function productImageFallback(imageElement) {
  imageElement.onerror = null;
  imageElement.src = PRODUCT_PLACEHOLDER;
}

function productCard(product) {
  return `<article class="product-card" data-product-url="${productUrl(product)}">
    <div class="product-image-wrap">
      ${product.featured ? '<span class="badge">Editor’s Pick</span>' : ""}

      <img class="product-image"
           src="${esc(product.image)}"
           alt="${esc(product.name)}"
           loading="lazy"
           onerror="productImageFallback(this)">
    </div>

    <div class="product-body">
      <span class="crumb">${esc(product.category)} · ${esc(product.subcategory)}</span>

      <h3>${esc(product.name)}</h3>

      <p>${esc(product.shortDescription || product.description)}</p>

      <div class="meta-row">
        ${
          product.rating
            ? `<span class="stars">★★★★★</span><span class="pill">${esc(product.rating)}/5</span>`
            : '<span class="pill">Editorial review</span>'
        }
      </div>

      <div class="product-actions">
        <a class="btn btn-outline" href="${productUrl(product)}">
          Read Review
        </a>

        <a
          class="btn btn-primary"
          href="${esc(product.amazonLink)}"
          target="_blank"
          rel="nofollow sponsored noopener"
        >
          Check on Amazon ↗
        </a>
      </div>
    </div>
  </article>`;
}

function renderProducts(list, id = "products-grid") {
  const grid = document.getElementById(id);

  if (!grid) return;

  grid.innerHTML = list.length
    ? list.map(productCard).join("")
    : `<div class="empty">
        <h3>No products in this section yet</h3>
        <p>More handpicked recommendations will be added soon.</p>
      </div>`;
}

function setupFilters(list) {
  const search = document.getElementById("product-search");
  const filters = [...document.querySelectorAll(".filter")];

  let active = new URLSearchParams(location.search).get("subcategory") || "all";

  function apply() {
    const query = (search?.value || "").toLowerCase().trim();

    renderProducts(
      list.filter(
        (product) =>
          (active === "all" || product.subcategory === active) &&
          (!query ||
            [
              product.name,
              product.category,
              product.subcategory,
              product.description,
              ...(product.tags || []),
            ]
              .join(" ")
              .toLowerCase()
              .includes(query)),
      ),
    );
  }

  filters.forEach((button) => {
    if (button.dataset.subcategory === active) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      filters.forEach((item) => item.classList.remove("active"));

      button.classList.add("active");

      active = button.dataset.subcategory;

      apply();
    });
  });

  search?.addEventListener("input", apply);

  apply();
}

function setupNav() {
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav-main");
  const navDrop = document.querySelector(".nav-categories");
  const trigger = document.querySelector(".categories-trigger");
  const panel = document.querySelector(".categories-mega");

  if (!menuBtn || !nav || !navDrop || !trigger || !panel) return;

  let open = false;

  const setCategoryOpen = (next, focusTrigger = false) => {
    open = next;

    navDrop.classList.toggle("is-open", open);

    trigger.setAttribute("aria-expanded", String(open));

    panel.hidden = !open;

    if (open) {
      panel.removeAttribute("aria-hidden");
    } else {
      panel.setAttribute("aria-hidden", "true");

      if (focusTrigger) {
        trigger.focus();
      }
    }
  };

  const setMobileOpen = (next) => {
    nav.classList.toggle("open", next);

    menuBtn.setAttribute("aria-expanded", String(next));

    menuBtn.setAttribute("aria-label", next ? "Close menu" : "Open menu");

    if (!next) {
      setCategoryOpen(false);
    }
  };

  menuBtn.addEventListener("click", () => {
    setMobileOpen(!nav.classList.contains("open"));
  });

  // Click is the primary interaction.
  // No hover-open means the panel cannot disappear
  // while the pointer travels from the trigger into the panel.
  trigger.addEventListener("click", (event) => {
    event.preventDefault();

    setCategoryOpen(!open);
  });

  document.addEventListener("click", (event) => {
    if (!navDrop.contains(event.target)) {
      setCategoryOpen(false);
    }

    if (
      window.innerWidth <= 760 &&
      !nav.contains(event.target) &&
      !menuBtn.contains(event.target)
    ) {
      setMobileOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();

      setCategoryOpen(false, true);
    }
  });

  nav.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (!nav.contains(document.activeElement)) {
        setCategoryOpen(false);
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      nav.classList.remove("open");

      menuBtn.setAttribute("aria-expanded", "false");

      menuBtn.setAttribute("aria-label", "Open menu");
    }

    if (window.innerWidth <= 760 && !nav.classList.contains("open")) {
      setCategoryOpen(false);
    }
  });

  setCategoryOpen(false);
}

function setupYear() {
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

async function initHome() {
  renderProducts(
    (await loadProducts()).filter((product) => product.featured),
    "featured-grid",
  );
}

async function initProducts() {
  const all = await loadProducts();

  const query = new URLSearchParams(location.search);

  const category = document.body.dataset.category || query.get("category");

  const list = category
    ? all.filter((product) => product.category === category)
    : all;

  const title = document.getElementById("listing-title");

  if (title && category) {
    title.textContent = category;
  }

  const subfilterWrap = document.getElementById("subfilters");

  const subcategories = category ? CATEGORIES[category] || [] : [];

  if (subfilterWrap) {
    subfilterWrap.innerHTML =
      `<button
        class="filter ${!query.get("subcategory") ? "active" : ""}"
        data-subcategory="all"
      >
        All
      </button>` +
      subcategories
        .map(
          (subcategory) =>
            `<button
              class="filter"
              data-subcategory="${esc(subcategory)}"
            >
              ${esc(subcategory)}
            </button>`,
        )
        .join("");
  }

  setupFilters(list);
}

async function initProduct() {
  const id = new URLSearchParams(location.search).get("id");

  const products = await loadProducts();

  const product = products.find((item) => String(item.id) === String(id));

  const root = document.getElementById("product-detail");

  if (!product) {
    root.innerHTML =
      '<div class="empty">' +
      "<h2>Product not found</h2>" +
      "<p>Return to the product list and choose another review.</p>" +
      "</div>";

    return;
  }

  document.title = `${product.name} Review & Buying Guide | KartGuru`;

  const specs = Object.entries(product.specs || {})
    .map(
      ([key, value]) =>
        `<tr>
            <td>${esc(key)}</td>
            <td>${esc(value)}</td>
          </tr>`,
    )
    .join("");

  const pros = (product.pros || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join("");

  const cons = (product.cons || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join("");

  /*
    Breadcrumb:
    Home / Category / Subcategory / Product
  */
  root.innerHTML = `
    <div class="breadcrumbs">
      <a href="index.html">Home</a>
      /
      <a href="${categoryUrl(product.category)}">
        ${esc(product.category)}
      </a>
      /
      <a href="${categoryUrl(product.category, product.subcategory)}">
        ${esc(product.subcategory)}
      </a>
      /
      ${esc(product.name)}
    </div>

    <div class="review-layout">

      <aside class="review-image">

        <img
          src="${esc(product.image)}"
          alt="${esc(product.name)}"
          onerror="productImageFallback(this)"
        >

        <a
          class="btn btn-primary"
          style="width:100%;margin-top:12px"
          href="${esc(product.amazonLink)}"
          target="_blank"
          rel="nofollow sponsored noopener"
        >
          Check latest details on Amazon ↗
        </a>

        <p class="affiliate-note">
          Affiliate link (paid link): we may earn a commission
          from qualifying purchases.
        </p>

      </aside>

      <main class="review-main">

        <span class="crumb">
          ${esc(product.category)} · ${esc(product.subcategory)}
        </span>

        <h1>
          ${esc(product.name)}
        </h1>

        <p class="lead">
          ${esc(product.description)}
        </p>

        <div class="meta-row">
          <span class="pill">
            Editorial review
          </span>
        </div>

        <div class="notice">
          Prices and availability can change.
          Always check the current Amazon listing before purchase.
        </div>

        <section class="review-section">
          <h2>Our Verdict</h2>
          <p>${esc(product.verdict)}</p>
        </section>

        <section class="review-section">
          <h2>Key Specifications</h2>

          <table class="spec-table">
            ${specs}
          </table>
        </section>

        <section class="review-section">

          <div class="procon">

            <div class="pro">
              <h3>Pros</h3>
              <ul>
                ${pros}
              </ul>
            </div>

            <div class="con">
              <h3>Cons</h3>
              <ul>
                ${cons}
              </ul>
            </div>

          </div>

        </section>

        <section class="review-section">

          <h2>Where to Buy</h2>

          <p>
            Use the button below to see the current product
            details, variants, price and availability.
          </p>

          <a
            class="btn btn-primary"
            href="${esc(product.amazonLink)}"
            target="_blank"
            rel="nofollow sponsored noopener"
          >
            Check on Amazon ↗
          </a>

        </section>

      </main>

    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  setupNav();
  setupYear();

  const page = document.body.dataset.page;

  if (page === "home") {
    await initHome();
  }

  if (page === "products") {
    await initProducts();
  }

  if (page === "product") {
    await initProduct();
  }
});

/* =========================================================
   FULL PRODUCT CARD CLICK
   =========================================================
   Entire card → Product Review
   Read Review → Product Review
   Check on Amazon → Amazon
   ========================================================= */

document.addEventListener("click", (event) => {
  const card = event.target.closest(".product-card");

  if (!card) return;

  /*
    If the user clicked an actual link/button/input,
    let that element handle its own action.
    
    This is especially important for:
    - Read Review
    - Check on Amazon
  */
  if (event.target.closest("a, button, input, select, textarea")) {
    return;
  }

  const url = card.dataset.productUrl;

  if (url) {
    window.location.href = url;
  }
});
