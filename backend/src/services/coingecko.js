// Thin wrapper around the CoinGecko "simple price" endpoint with a short
// in-memory cache, so we don't hammer their API on every page view and
// don't expose rate-limit/CORS/API-key details to the browser.

const COIN_ID = process.env.COINGECKO_COIN_ID || "effective-accelerationism";
const API_KEY = process.env.COINGECKO_API_KEY || null;
// "demo" (free tier key, still on api.coingecko.com) or "pro" (paid tier,
// on pro-api.coingecko.com). Defaults to demo since that's the common case.
const KEY_TYPE = (process.env.COINGECKO_API_KEY_TYPE || "demo").toLowerCase();
const CACHE_TTL_MS = 60 * 1000; // 60s

const BASE_URL =
  KEY_TYPE === "pro" ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";

let cache = { data: null, fetchedAt: 0 };

async function getPrice() {
  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const url = `${BASE_URL}/simple/price?ids=${encodeURIComponent(
    COIN_ID
  )}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`;

  const headers = {};
  if (API_KEY) {
    headers[KEY_TYPE === "pro" ? "x-cg-pro-api-key" : "x-cg-demo-api-key"] = API_KEY;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`CoinGecko responded with ${res.status}`);
  }

  const json = await res.json();
  const coin = json[COIN_ID];

  const data = coin
    ? {
        available: true,
        price: coin.usd ?? null,
        marketCap: coin.usd_market_cap ?? null,
        volume24h: coin.usd_24h_vol ?? null,
      }
    : { available: false };

  cache = { data, fetchedAt: now };
  return data;
}

module.exports = { getPrice, COIN_ID };
