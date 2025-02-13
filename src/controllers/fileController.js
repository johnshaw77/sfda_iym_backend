const { PrismaClient } = require("@prisma/client");
const fileProcessing = require("../services/fileProcessing");
const path = require("path");
const fs = require("fs").promises;
const {
  getServerUrl,
  getFileUrl,
  getDecodedFileName,
} = require("../utils/file");

const prisma = new PrismaClient();

const handleFileUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "沒有上傳檔案",
      });
    }

    // 記錄完整的請求檔案資訊
    console.log("檔案上傳請求資訊：", {
      data: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
      headers: req.headers["content-type"],
    });

    // 直接使用原始檔案名，不進行編碼
    const originalFilename = req.file.originalname;
    console.log("原始檔案名：", originalFilename);
    console.log("檔案系統中的檔案名：", req.file.filename);

    // 檢查檔案名編碼
    console.log(
      "檔案名 Buffer：",
      Buffer.from(originalFilename).toString("hex")
    );
    console.log(
      "檔案名 UTF8：",
      Buffer.from(originalFilename, "utf8").toString()
    );
    console.log(
      "檔案名 Latin1：",
      Buffer.from(originalFilename, "latin1").toString("utf8")
    );

    // 創建檔案記錄
    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        originalname: originalFilename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        workflowId: req.body.workflowId || null,
        status: "completed",
        metadata: JSON.stringify({
          uploadedBy: req.user?.id,
          encoding: req.file.encoding,
          uploadedAt: new Date().toISOString(),
        }),
      },
    });

    // 反序列化 metadata 用於響應
    const responseFile = {
      ...file,
      metadata: file.metadata ? JSON.parse(file.metadata) : null,
    };

    res.status(201).json({
      message: "檔案上傳成功",
      data: responseFile,
    });
  } catch (error) {
    console.error("檔案上傳錯誤：", error);
    next(error);
  }
};

const processFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { action, options } = req.body;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "檔案不存在",
      });
    }

    let processedPath;
    switch (action) {
      case "compress":
        if (file.mimetype.startsWith("image/")) {
          processedPath = await fileProcessing.compressImage(
            file.path,
            options
          );
        } else {
          processedPath = await fileProcessing.compressFile(
            file.path,
            options?.format || "zip"
          );
        }
        break;
      case "thumbnail":
        if (!file.mimetype.startsWith("image/")) {
          return res.status(400).json({
            code: 400,
            success: false,
            error: "只能為圖片生成縮圖",
          });
        }
        processedPath = await fileProcessing.generateThumbnail(
          file.path,
          options
        );
        break;
      case "convert":
        if (!options?.format) {
          return res.status(400).json({
            code: 400,
            success: false,
            error: "需要指定轉換格式",
          });
        }
        processedPath = await fileProcessing.convertFormat(
          file.path,
          options.format
        );
        break;
      default:
        return res.status(400).json({
          code: 400,
          success: false,
          error: "不支援的處理操作",
        });
    }

    // 創建新的檔案記錄
    const processedFile = await prisma.file.create({
      data: {
        filename: path.basename(processedPath),
        originalname: path.basename(processedPath),
        path: processedPath,
        mimetype: file.mimetype,
        size: (await fs.stat(processedPath)).size,
        workflowId: file.workflowId,
        status: "completed",
        metadata: {
          processedFrom: file.id,
          action,
          options,
        },
      },
    });

    // 生成完整的 URL
    const serverUrl = getServerUrl();
    const fileUrl = getFileUrl(serverUrl, processedFile.path);

    res.json({
      code: 200,
      success: true,
      data: {
        id: processedFile.id,
        workflowId: processedFile.workflowId,
        name: processedFile.originalname,
        size: processedFile.size,
        type: processedFile.mimetype,
        url: fileUrl,
        uploadedAt: processedFile.createdAt,
        updatedAt: processedFile.updatedAt,
      },
    });
  } catch (error) {
    console.error("檔案處理錯誤：", error);
    next(error);
  }
};

const getFileInfo = async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "檔案不存在" });
    }

    // 反序列化 metadata
    const responseFile = {
      ...file,
      metadata: file.metadata ? JSON.parse(file.metadata) : null,
    };

    res.json(responseFile);
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
    });

    if (!file) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "檔案不存在",
      });
    }

    // 刪除實體檔案
    await fs.unlink(file.path);
    if (file.thumbnailPath) {
      await fs.unlink(file.thumbnailPath).catch(() => {}); // 忽略縮圖刪除錯誤
    }

    // 刪除資料庫記錄
    await prisma.file.delete({
      where: { id: file.id },
    });

    res.json({
      code: 200,
      success: true,
      message: "檔案已成功刪除",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 上傳一般檔案
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "未找到上傳的檔案",
      });
    }

    const serverUrl = getServerUrl();
    const fileUrl = getFileUrl(serverUrl, req.file.path);

    // 儲存檔案資訊到資料庫
    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });

    res.json({
      code: 200,
      success: true,
      data: {
        id: file.id,
        name: getDecodedFileName(file.originalname),
        size: file.size,
        type: file.mimetype,
        url: fileUrl,
        uploadedAt: file.createdAt,
        updatedAt: file.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 上傳工作流程檔案
 */
const uploadWorkflowFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "未找到上傳的檔案",
      });
    }

    const { workflowId } = req.body;
    if (!workflowId) {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "未提供工作流程 ID",
      });
    }

    const serverUrl = getServerUrl();
    const fileUrl = getFileUrl(serverUrl, req.file.path);

    // 儲存檔案資訊到資料庫
    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        workflowId: workflowId,
      },
    });

    res.json({
      code: 200,
      success: true,
      data: {
        id: file.id,
        workflowId: file.workflowId,
        name: getDecodedFileName(file.originalname),
        size: file.size,
        type: file.mimetype,
        url: fileUrl,
        uploadedAt: file.createdAt,
        updatedAt: file.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取檔案資訊
 */
const getFile = async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
    });

    if (!file) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "檔案不存在",
      });
    }

    const serverUrl = getServerUrl();
    const fileUrl = getFileUrl(serverUrl, file.path);

    res.json({
      code: 200,
      success: true,
      data: {
        id: file.id,
        workflowId: file.workflowId,
        name: getDecodedFileName(file.originalname),
        size: file.size,
        type: file.mimetype,
        url: fileUrl,
        uploadedAt: file.createdAt,
        updatedAt: file.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 下載檔案
 */
const downloadFile = async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
    });

    if (!file) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "檔案不存在於伺服器",
      });
    }

    const filePath = path.join(__dirname, "../../", file.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "檔案不存在於伺服器",
      });
    }

    res.download(filePath, getDecodedFileName(file.originalname));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleFileUpload,
  getFileInfo,
  deleteFile,
  processFile,
  uploadFile,
  uploadWorkflowFile,
  getFile,
  downloadFile,
};
