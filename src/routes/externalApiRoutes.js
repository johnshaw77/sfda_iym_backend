const express = require("express");
const router = express.Router();
const externalApiService = require("../services/externalApiService");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateRequest } = require("../middlewares/validateRequest");
const Joi = require("joi");

/**
 * @swagger
 * tags:
 *   name: ExternalAPI
 *   description: 外部 API 代理
 */

/**
 * @swagger
 * /api/external/analysis/correlation:
 *   post:
 *     summary: 執行相關性分析
 *     tags: [ExternalAPI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 description: 分析數據
 *               parameters:
 *                 type: object
 *                 description: 分析參數
 *     responses:
 *       200:
 *         description: 分析結果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correlationMatrix:
 *                   type: array
 *                   description: 相關性矩陣
 *                 significantPairs:
 *                   type: array
 *                   description: 顯著相關對
 */
router.post(
  "/analysis/correlation",
  validateRequest({
    body: Joi.object({
      data: Joi.object().required(),
      parameters: Joi.object(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const result = await externalApiService.post(
      "analysis/correlation",
      req.body
    );
    res.json(result);
  })
);

/**
 * @swagger
 * /api/external/analysis/anova:
 *   post:
 *     summary: 執行方差分析 (ANOVA)
 *     tags: [ExternalAPI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 description: 分析數據
 *               parameters:
 *                 type: object
 *                 description: 分析參數
 *     responses:
 *       200:
 *         description: 分析結果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 anovaTable:
 *                   type: object
 *                   description: ANOVA 表
 *                 pValue:
 *                   type: number
 *                   description: P 值
 */
router.post(
  "/analysis/anova",
  validateRequest({
    body: Joi.object({
      data: Joi.object().required(),
      parameters: Joi.object(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const result = await externalApiService.post("analysis/anova", req.body);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/external/complaints/{id}:
 *   get:
 *     summary: 獲取客訴詳情
 *     tags: [ExternalAPI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 客訴 ID
 *     responses:
 *       200:
 *         description: 客訴詳情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 客訴 ID
 *                 title:
 *                   type: string
 *                   description: 客訴標題
 *                 description:
 *                   type: string
 *                   description: 客訴描述
 *                 status:
 *                   type: string
 *                   description: 客訴狀態
 */
router.get(
  "/complaints/:id",
  asyncHandler(async (req, res) => {
    const result = await externalApiService.get(`complaints/${req.params.id}`);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/external/complaints:
 *   get:
 *     summary: 獲取客訴列表
 *     tags: [ExternalAPI]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 客訴狀態過濾
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每頁數量
 *     responses:
 *       200:
 *         description: 客訴列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get(
  "/complaints",
  asyncHandler(async (req, res) => {
    const result = await externalApiService.get("complaints", req.query);
    res.json(result);
  })
);

module.exports = router;
