// 檔案位置: backend/index.ts (已更新)

import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cors from "cors";
import multer from "multer";
import path from "path";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3007;

// 中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 上傳圖片設定
const upload = multer({ dest: path.join(process.cwd(), "public/uploads/") });
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// ========================
// 會員系統 (無變動)
// ========================
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "name, email, password required" });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: "Email already exists" });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed } });
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "User not found" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Incorrect password" });
  res.json({ id: user.id, name: user.name, email: user.email });
});

// ========================
// 商品 CRUD (新增了 /products/batch API)
// ========================
app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// 【新功能】 根據 ID 列表批量獲取商品資訊
app.post("/products/batch", async (req, res) => {
    const { ids } = req.body; // 期望收到 { ids: [1, 2, 3] }
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "Product IDs array is required." });
    }
    const products = await prisma.product.findMany({
        where: {
            id: { in: ids },
        },
    });
    res.json(products);
});

app.post("/products", upload.single("image"), async (req, res) => {
  const { name, price, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
  const product = await prisma.product.create({
    data: { name, price: parseFloat(price), description, image: imageUrl },
  });
  res.json(product);
});

app.put("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, description } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: { name, price: parseFloat(price), description },
  });
  res.json(product);
});

app.delete("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.json({ message: "Deleted" });
});

// ========================
// 訂單 (已修改為支援多商品訂單)
// ========================
app.post("/orders", async (req, res) => {
    const { userId, items } = req.body; // 期望收到 { userId: 1, items: [{productId: 1, quantity: 2}, ...] }
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "userId and a non-empty items array are required." });
    }

    try {
        // 在一個 transaction 中完成訂單建立，確保資料一致性
        const newOrder = await prisma.$transaction(async (tx) => {
            // 1. 建立主訂單
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    // 可以在這裡計算總金額等
                },
            });

            // 2. 為訂單中的每個商品建立 OrderItem
            for (const item of items) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                    },
                });
            }
            return order;
        });
        res.status(201).json({ message: "Order created successfully", orderId: newOrder.id });
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ error: "Could not create order." });
    }
});

// ========================
// 每日簽到 (無變動)
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

// 【新功能】 取得使用者近七日的簽到紀錄
app.get("/signin/history/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.status(400).json({ error: "userId required" });

    // 設定日期範圍 (今天到六天前)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 當天結束
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0); // 七天前開始

    const records = await prisma.signin.findMany({
        where: {
            userId: userId,
            date: {
                gte: sevenDaysAgo, // 大於等於七天前
                lte: today,      // 小於等於今天
            },
        },
        orderBy: {
            date: 'asc',
        },
    });

    // 將日期格式化為 YYYY-MM-DD 字串，方便前端比對
    const formattedRecords = records.map(r => r.date.toISOString().split('T')[0]);
    res.json(formattedRecords);
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Express + TS 啟動 http://localhost:${port}`);
});