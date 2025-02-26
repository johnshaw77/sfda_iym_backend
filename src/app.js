const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { errorHandler } = require("./middlewares/errorHandler");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const loggerMiddleware = require("./middlewares/loggerMiddleware");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// 中間件設置
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// 應用日誌中間件
app.use(loggerMiddleware);

// 靜態檔案服務
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Swagger 設置
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SFDA IYM API",
      version: "1.0.0",
      description: "SFDA IYM API 文檔",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 導入路由
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const flowTemplateRoutes = require("./routes/flowTemplateRoutes");
const flowInstanceRoutes = require("./routes/flowInstanceRoutes");
const externalApiRoutes = require("./routes/externalApiRoutes");

// 註冊路由
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/flow-templates", flowTemplateRoutes);
app.use("/api/flow-instances", flowInstanceRoutes);
app.use("/api/external", externalApiRoutes);

// 錯誤處理中間件
app.use(errorHandler);

// 全局錯誤處理中間件
app.use((err, req, res, next) => {
  const { logger } = require("./utils/logger");
  logger.error("未處理的錯誤:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    user: req.user,
  });

  res.status(500).json({
    message: "伺服器錯誤",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 優雅關閉
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
  console.log(`API 文檔可在 http://localhost:${PORT}/api-docs 查看`);
});

module.exports = app;
