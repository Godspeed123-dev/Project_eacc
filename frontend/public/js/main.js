// E/ACC site scripts — copy-to-clipboard, home slider, CoinGecko stats, nav effects.

document.addEventListener("DOMContentLoaded", () => {
  initCopyAddress();
  initGallerySlider();
  initCoinGeckoStats();
  initSocialsScroll();
  initLazyTweets();
});

/* ---------- Copy contract address ---------- */
function initCopyAddress() {
  const caLink = document.getElementById("caAddress");
  if (!caLink) return;

  caLink.addEventListener("click", (event) => {
    event.preventDefault();
    const caText = caLink.innerText.trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(caText)
        .then(showCopyPopup)
        .catch(() => copyUsingExecCommand(caText));
    } else {
      copyUsingExecCommand(caText);
    }
  });
}

function copyUsingExecCommand(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showCopyPopup();
  } catch (err) {
    console.error("Error copying text:", err);
  } finally {
    document.body.removeChild(textarea);
  }
}

function showCopyPopup() {
  const popup = document.getElementById("copyPopup");
  if (!popup) return;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
}

/* ---------- Home-page gallery slider (lazy: only loads the image being shown) ---------- */
function initGallerySlider() {
  const sliderImage = document.getElementById("gallerySliderImage");
  if (!sliderImage) return;

  const galleryImages = Array.from({ length: 45 }, (_, i) => {
    const n = i + 1;
    const ext = n === 9 ? "jpg" : "jpeg";
    return `gallery/${n}.${ext}`;
  });

  let currentIndex = 0;

  function showImage(index) {
    sliderImage.src = galleryImages[index];
    sliderImage.style.transform = "translateX(0)";
    sliderImage.style.opacity = 1;
  }

  window.changeImage = function (direction) {
    sliderImage.style.transform = `translateX(${direction === 1 ? -20 : 20}px)`;
    sliderImage.style.opacity = 0;

    setTimeout(() => {
      currentIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
      sliderImage.src = galleryImages[currentIndex];
      sliderImage.style.transform = `translateX(${direction === 1 ? 20 : -20}px)`;
      void sliderImage.offsetWidth;
      sliderImage.style.transform = "translateX(0)";
      sliderImage.style.opacity = 1;
    }, 500);
  };

  showImage(currentIndex);
}

function formatPrice(num) {
  if (num === 0) return "$0";
  const decimals =
    num >= 1 ? 2 : Math.min(10, Math.max(4, -Math.floor(Math.log10(Math.abs(num))) + 2));
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/* ---------- Live stats (via our own backend, which proxies + caches CoinGecko) ---------- */
function initCoinGeckoStats() {
  const priceEl = document.getElementById("coingecko-price");
  const marketCapEl = document.getElementById("coingecko-market-cap");
  const volumeEl = document.getElementById("coingecko-volume-24h");
  if (!priceEl) return;

  fetch("/api/price")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (data.available) {
        priceEl.textContent = data.price != null ? formatPrice(data.price) : "N/A";
        marketCapEl.textContent =
          data.marketCap != null ? `$${data.marketCap.toLocaleString()}` : "N/A";
        volumeEl.textContent =
          data.volume24h != null ? `$${data.volume24h.toLocaleString()}` : "N/A";
      } else {
        priceEl.textContent = "Data not available";
        marketCapEl.textContent = "Data not available";
        volumeEl.textContent = "Data not available";
      }
    })
    .catch((error) => {
      console.error("Error fetching price data:", error);
      priceEl.textContent = "Error loading data";
      marketCapEl.textContent = "Error loading data";
      volumeEl.textContent = "Error loading data";
    });
}

/* ---------- Smooth-scroll + highlight for the Socials nav link ---------- */
function initSocialsScroll() {
  const socialsLink = document.getElementById("socials-link");
  if (!socialsLink) return;

  socialsLink.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.getElementById("social-links-section");
    if (target) target.scrollIntoView({ behavior: "smooth" });

    document.querySelectorAll(".social-links a").forEach((link) => {
      link.classList.add("highlight-social");
      link.addEventListener("animationend", () => link.classList.remove("highlight-social"), {
        once: true,
      });
    });
  });
}

/* ---------- Lazy-load Twitter embeds only when scrolled near ---------- */
function initLazyTweets() {
  const tweetContainers = document.querySelectorAll(".video-container");
  if (!tweetContainers.length || !("IntersectionObserver" in window)) {
    loadTwitterWidgets();
    return;
  }

  let loaded = false;
  const observer = new IntersectionObserver(
    (entries) => {
      if (loaded) return;
      if (entries.some((entry) => entry.isIntersecting)) {
        loaded = true;
        loadTwitterWidgets();
        observer.disconnect();
      }
    },
    { rootMargin: "300px" }
  );

  tweetContainers.forEach((el) => observer.observe(el));
}

function loadTwitterWidgets() {
  if (document.getElementById("twitter-widgets-js")) return;
  const script = document.createElement("script");
  script.id = "twitter-widgets-js";
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  document.body.appendChild(script);
}
