const express = require("express");
const { getPrice } = require("../services/coingecko");

const router = express.Router();

// GET /api/price — current price / market cap / 24h volume, cached server-side.
router.get("/price", async (req, res) => {
  try {
    const data = await getPrice();
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch price data:", err.message);
    res.status(502).json({ available: false, error: "Failed to fetch price data" });
  }
});

module.exports = router;
