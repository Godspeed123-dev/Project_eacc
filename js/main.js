/**
 * E/ACC Website
 * Client-side functionality:
 * - Contract address copy
 * - Gallery slider
 * - CoinGecko market data
 * - Social navigation
 * - Lazy Twitter embeds
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initCopyAddress();
  initGallerySlider();
  initCoinGeckoStats();
  initSocialsScroll();
  initLazyTweets();
});

/* =========================================================
   Contract Address
   ========================================================= */

function initCopyAddress() {
  const caLink = document.getElementById("caAddress");

  if (!caLink) return;

  caLink.addEventListener("click", async (event) => {
    event.preventDefault();

    const address = caLink.textContent.trim();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        copyUsingExecCommand(address);
      }

      showCopyPopup();
    } catch (error) {
      console.error("Clipboard error:", error);
      copyUsingExecCommand(address);
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
    if (document.execCommand("copy")) {
      showCopyPopup();
    }
  } catch (error) {
    console.error("Fallback clipboard error:", error);
  } finally {
    textarea.remove();
  }
}

function showCopyPopup() {
  const popup = document.getElementById("copyPopup");

  if (!popup) return;

  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
}

/* =========================================================
   Gallery Slider
   ========================================================= */

function initGallerySlider() {
  const sliderImage = document.getElementById("gallerySliderImage");

  if (!sliderImage) return;

  const galleryImages = Array.from(
    { length: 45 },
    (_, index) => {
      const number = index + 1;
      const extension = number === 9 ? "jpg" : "jpeg";

      return `gallery/${number}.${extension}`;
    }
  );

  let currentIndex = 0;
  let isAnimating = false;

  function showImage(index) {
    sliderImage.src = galleryImages[index];
    sliderImage.alt = `Gallery image ${index + 1}`;
    sliderImage.style.transform = "translateX(0)";
    sliderImage.style.opacity = "1";
  }

  window.changeImage = function (direction) {
    if (isAnimating) return;

    isAnimating = true;

    const exitDirection = direction === 1 ? -20 : 20;

    sliderImage.style.transform = `translateX(${exitDirection}px)`;
    sliderImage.style.opacity = "0";

    setTimeout(() => {
      currentIndex =
        (currentIndex + direction + galleryImages.length) %
        galleryImages.length;

      sliderImage.src = galleryImages[currentIndex];

      const enterDirection = direction === 1 ? 20 : -20;

      sliderImage.style.transform = `translateX(${enterDirection}px)`;

      // Force browser reflow so the transition works.
      void sliderImage.offsetWidth;

      sliderImage.style.transform = "translateX(0)";
      sliderImage.style.opacity = "1";

      setTimeout(() => {
        isAnimating = false;
      }, 500);
    }, 500);
  };

  showImage(currentIndex);
}

/* =========================================================
   CoinGecko Market Data
   ========================================================= */

function initCoinGeckoStats() {
  const priceEl = document.getElementById("coingecko-price");
  const marketCapEl = document.getElementById("coingecko-market-cap");
  const volumeEl = document.getElementById("coingecko-volume-24h");

  if (!priceEl || !marketCapEl || !volumeEl) return;

  const coinId = "effective-accelerationism";

  const apiUrl =
    "https://api.coingecko.com/api/v3/simple/price" +
    `?ids=${encodeURIComponent(coinId)}` +
    "&vs_currencies=usd" +
    "&include_market_cap=true" +
    "&include_24hr_vol=true";

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`CoinGecko HTTP ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      const coin = data?.[coinId];

      if (!coin) {
        throw new Error(
          `CoinGecko returned no data for "${coinId}"`
        );
      }

      priceEl.textContent =
        coin.usd != null ? formatPrice(coin.usd) : "N/A";

      marketCapEl.textContent =
        coin.usd_market_cap != null
          ? formatCurrency(coin.usd_market_cap)
          : "N/A";

      volumeEl.textContent =
        coin.usd_24h_vol != null
          ? formatCurrency(coin.usd_24h_vol)
          : "N/A";
    })
    .catch((error) => {
      console.error("CoinGecko error:", error);

      priceEl.textContent = "Unavailable";
      marketCapEl.textContent = "Unavailable";
      volumeEl.textContent = "Unavailable";
    });
}

/* =========================================================
   Number Formatting
   ========================================================= */

function formatPrice(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  if (value === 0) {
    return "$0";
  }

  let decimals;

  if (value >= 1) {
    decimals = 2;
  } else {
    decimals = Math.min(
      10,
      Math.max(4, -Math.floor(Math.log10(Math.abs(value))) + 2)
    );
  }

  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function formatCurrency(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

/* =========================================================
   Social Navigation
   ========================================================= */

function initSocialsScroll() {
  const socialsLink = document.getElementById("socials-link");

  if (!socialsLink) return;

  socialsLink.addEventListener("click", (event) => {
    event.preventDefault();

    const target = document.getElementById(
      "social-links-section"
    );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    document
      .querySelectorAll(".social-links a")
      .forEach((link) => {
        link.classList.add("highlight-social");

        link.addEventListener(
          "animationend",
          () => {
            link.classList.remove("highlight-social");
          },
          { once: true }
        );
      });
  });
}

/* =========================================================
   Lazy Twitter Embeds
   ========================================================= */

function initLazyTweets() {
  const tweetContainers =
    document.querySelectorAll(".video-container");

  if (!tweetContainers.length) return;

  if (!("IntersectionObserver" in window)) {
    loadTwitterWidgets();
    return;
  }

  let loaded = false;

  const observer = new IntersectionObserver(
    (entries) => {
      if (loaded) return;

      const shouldLoad = entries.some(
        (entry) => entry.isIntersecting
      );

      if (shouldLoad) {
        loaded = true;
        loadTwitterWidgets();
        observer.disconnect();
      }
    },
    {
      rootMargin: "300px",
    }
  );

  tweetContainers.forEach((container) => {
    observer.observe(container);
  });
}

function loadTwitterWidgets() {
  if (document.getElementById("twitter-widgets-js")) {
    return;
  }

  const script = document.createElement("script");

  script.id = "twitter-widgets-js";
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;

  document.body.appendChild(script);
}