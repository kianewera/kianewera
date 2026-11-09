require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, "products.json");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET wajib diisi dengan nilai acak minimal 32 karakter.");
  process.exit(1);
}
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
  console.error("ADMIN_EMAIL dan ADMIN_PASSWORD_HASH wajib diisi di .env.");
  process.exit(1);
}

app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }));

function readProducts() {
  try { return JSON.parse(fs.readFileSync(DATA, "utf8")); }
  catch { return []; }
}
function writeProducts(items) {
  fs.writeFileSync(DATA, JSON.stringify(items, null, 2));
}
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\\s+/i, "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.email !== process.env.ADMIN_EMAIL) throw new Error("forbidden");
    req.admin = payload;
    next();
  } catch { res.status(401).json({ error: "Sesi tidak valid. Silakan login kembali." }); }
}

app.get("/api/products", (_req, res) => {
  res.json(readProducts().filter(p => p.active !== false));
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (email !== process.env.ADMIN_EMAIL ||
      !(await bcrypt.compare(String(password || ""), process.env.ADMIN_PASSWORD_HASH))) {
    return res.status(401).json({ error: "Email atau password salah." });
  }
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "4h" });
  res.json({ token, email });
});

app.get("/api/admin/products", auth, (_req, res) => res.json(readProducts()));
app.post("/api/admin/products", auth, (req, res) => {
  const { name, description = "", price } = req.body || {};
  const amount = Number(price);
  if (!name || !Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({ error: "Nama dan harga yang valid wajib diisi." });
  }
  const items = readProducts();
  const item = { id: Date.now().toString(), name: String(name).slice(0, 80),
    description: String(description).slice(0, 300), price: amount, active: true };
  items.push(item); writeProducts(items); res.status(201).json(item);
});
app.delete("/api/admin/products/:id", auth, (req, res) => {
  const items = readProducts().filter(p => p.id !== req.params.id);
  writeProducts(items); res.json({ ok: true });
});

// Tempat integrasi payment gateway. Belum memproses pembayaran sampai adapter
// resmi provider dipasang dan diverifikasi di sisi server.
app.get("/api/payment/status", (_req, res) => {
  res.json({ configured: Boolean(process.env.PAYMENT_API_BASE_URL && process.env.PAYMENT_API_KEY),
    message: "API key terdeteksi di server; integrasi provider belum diaktifkan." });
});

app.get("/admin", (_req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Toko berjalan di http://localhost:${PORT}`));
