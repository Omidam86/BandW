const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { supabase } = require("./config/supabase");
const { errorHandler } = require("./middlewares/errorMiddleware");
const postRoutes = require("./routes/posts");
const categoryRoutes = require("./routes/category");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    messsage: "✅ BandW Backend API is running",
    version: "1.0.0",
    endpoints: {
      posts: "/api/posts",
      categories: "/api/categories",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route مورد نظر یافت نشد",
  });
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 BandW Backend running on http://localhost:${PORT}`);
  console.log(`📡 Supabase connected successfully`);
});
