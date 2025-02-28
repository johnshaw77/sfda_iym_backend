const { PrismaClient } = require("@prisma/client");
const { handlePrismaError } = require("../utils/errorHandler");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const prisma = new PrismaClient();
const { errorResponse, successResponse } = require("../utils/jsonResponse");
const { getServerUrl, getFileUrl } = require("../utils/serverUrl");
const { getDecodedFileName } = require("../utils/file");

// 取得所有文檔
const getAllDocuments = async (req, res) => {
  try {
    const documents = await prisma.flowDocument.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            projectNumber: true,
          },
        },
        instance: {
          select: {
            id: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    successResponse(res, 200, documents);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 根據專案 ID 取得文檔
const getDocumentsByProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const documents = await prisma.flowDocument.findMany({
      where: { projectId },
      include: {
        project: true,
        instance: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    successResponse(res, 200, documents);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 根據實例 ID 取得文檔
const getDocumentsByInstance = async (req, res) => {
  const { instanceId } = req.params;
  try {
    const documents = await prisma.flowDocument.findMany({
      where: { instanceId },
      include: {
        project: true,
        instance: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    successResponse(res, 200, documents);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 取得單一文檔
const getDocumentById = async (req, res) => {
  const { id } = req.params;
  try {
    const document = await prisma.flowDocument.findUnique({
      where: { id },
      include: {
        project: true,
        instance: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    if (!document) {
      return errorResponse(res, 404, "找不到指定的文檔");
    }
    successResponse(res, 200, document);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 上傳文檔
const uploadDocument = async (req, res) => {
  try {
    const { projectId, instanceId, docType } = req.body;
    const serverUrl = getServerUrl();
    console.log("serverUrl", serverUrl);

    // const fileUrl = getFileUrl(serverUrl, req.file.path);

    fileUrl = serverUrl + req.file.path;
    console.log(projectId, instanceId, docType);
    console.log("req.file.path", req.file.path);

    // 檢查專案是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse(res, 404, "專案不存在");
    }

    // 如果有 instanceId，檢查工作流程實例是否存在
    if (instanceId) {
      const instance = await prisma.flowInstance.findUnique({
        where: { id: instanceId },
      });

      if (!instance) {
        return errorResponse(res, 404, "工作流程實例不存在");
      }
    }

    // 建立文檔記錄
    const document = await prisma.flowDocument.create({
      data: {
        name: req.file.filename,
        docType,
        url: fileUrl,
        project: {
          connect: { id: projectId },
        },
        ...(instanceId && {
          instance: {
            connect: { id: instanceId },
          },
        }),
        creator: {
          connect: { id: req.user.id },
        },
      },
      include: {
        project: true,
        instance: true,
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    successResponse(res, 201, document);
  } catch (error) {
    console.error("上傳文檔失敗:", error);
    errorResponse(res, 500, "上傳文檔失敗");
  }
};

// 更新文檔資訊
const updateDocument = async (req, res) => {
  const { id } = req.params;
  const { docType, metadata } = req.body;

  try {
    const document = await prisma.flowDocument.update({
      where: { id },
      data: {
        docType,
        metadata: metadata ? JSON.parse(metadata) : undefined,
      },
      include: {
        project: true,
        instance: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    successResponse(res, 200, document);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 刪除文檔
const deleteDocument = async (req, res) => {
  const { id } = req.params;
  try {
    // 先取得文檔資訊
    const document = await prisma.flowDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return errorResponse(res, 404, "找不到指定的文檔");
    }

    // 刪除資料庫記錄
    await prisma.flowDocument.delete({
      where: { id },
    });

    // 刪除實體檔案
    if (document.url) {
      await fs.unlink(document.url).catch(console.error);
    }

    successResponse(res, 200, { message: "文檔已成功刪除" });
  } catch (error) {
    handlePrismaError(error, res);
  }
};

module.exports = {
  getAllDocuments,
  getDocumentsByProject,
  getDocumentsByInstance,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
};
