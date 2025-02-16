const express = require("express");
const router = express.Router();
const { testExternalApi } = require("../controllers/externalApiController");

// 測試外部 API 連接
router.get("/test", testExternalApi);

module.exports = router;
