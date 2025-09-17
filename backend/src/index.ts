import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cors from "cors";
import multer from "multer";
import path from "path";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3007;

// ----------------------
// 中間件
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // 允許前端跨域

// ----------------------
// 上傳圖片設定
// ----------------------
const upload = multer({ dest: path.join(process.cwd(), "public/uploads/") });

// ----------------------
// 靜態資源路徑
// ----------------------
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// ========================
// 會員系統
// ========================

// 註冊
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email, password required" });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: "Email already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed } });

  res.json({ id: user.id, name: user.name, email: user.email });
});


// 登入
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Incorrect password" });

  res.json({ id: user.id, name: user.name, email: user.email });
});

// ========================
// 商品 CRUD
// ========================

// 取得商品列表
app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// 新增商品（可上傳圖片）
app.post("/products", upload.single("image"), async (req, res) => {
  const { name, price, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

  const product = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price),
      description,
      image: imageUrl,
    },
  });
  res.json(product);
});

// 編輯商品
app.put("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, description } = req.body;

  const product = await prisma.product.update({
    where: { id },
    data: { name, price: parseFloat(price), description },
  });
  res.json(product);
});

// 刪除商品
app.delete("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.json({ message: "Deleted" });
});

// ========================
// 訂單
// ========================
app.post("/orders", async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || !quantity) return res.status(400).json({ error: "userId, productId, quantity required" });

  const order = await prisma.order.create({ data: { userId, productId, quantity } });
  res.json(order);
});

// ========================
// 每日簽到
// ========================
app.post("/signin", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exists = await prisma.signin.findFirst({ where: { userId, date: today } });
  if (exists) return res.json({ message: "Already signed in today" });

  const signin = await prisma.signin.create({ data: { userId, date: today } });
  res.json({ message: "簽到成功！", data: signin });
});

// ========================
// 啟動伺服器
// ========================
app.listen(port, () => {
  console.log(`Express + TS 啟動 http://localhost:${port}`);
});
