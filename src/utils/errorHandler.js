const { Prisma } = require('@prisma/client');
const { logger } = require('./logger');

/**
 * 處理 Prisma 相關錯誤
 * @param {Error} error - Prisma 錯誤對象
 * @param {Object} res - Express 響應對象
 */
const handlePrismaError = (error, res) => {
  logger.error('Prisma 錯誤:', {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack
  });

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          message: '資料已存在，違反唯一性約束'
        });
      case 'P2014':
        return res.status(400).json({
          message: '違反關聯約束'
        });
      case 'P2003':
        return res.status(400).json({
          message: '外鍵約束失敗'
        });
      case 'P2025':
        return res.status(404).json({
          message: '找不到要操作的記錄'
        });
      default:
        return res.status(500).json({
          message: '資料庫操作錯誤'
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {

    return res.status(400).json({
      message: '資料驗證錯誤',
      details: error.message
    });
  }

  return res.status(500).json({
    message: '伺服器內部錯誤'
  });
};

module.exports = {
  handlePrismaError
}; 