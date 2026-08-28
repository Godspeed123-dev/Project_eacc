require("dotenv").config();
const path = require("path");
const express = require("express");
const priceRouter = require("./routes/price");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, "../../frontend/public");

// --- API ---
app.use("/api", priceRouter);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// --- Static frontend ---
app.use(express.static(FRONTEND_DIR));

// 404 for anything else (unknown API route or missing asset)
app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`E/ACC server running at http://localhost:${PORT}`);
});
