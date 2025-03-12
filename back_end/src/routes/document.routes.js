const express = require('express');
const VerifyJwt = require('../middlewares/verifyJwt');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const createHttpError = require('http-errors');
const fs = require('fs');
const path = require('path');

const documentRouter = express.Router();

// Đường dẫn lưu trữ giấy tờ
const documentUploadPath = path.join(__dirname, '../uploads/documents');

/**
 * Tải lên giấy tờ xác minh (CCCD, giấy phép kinh doanh)
 * POST /api/documents/upload
 */
documentRouter.post(
  "/upload",
  [VerifyJwt.verifyToken],
  uploadMiddleware.uploadMultipleDocuments,
  async (req, res, next) => {
    try {
      const files = req.files;
      const userId = req.userId;
      
      if (!files || Object.keys(files).length === 0) {
        throw createHttpError.BadRequest("No files uploaded");
      }
      
      // Lưu thông tin tệp được tải lên
      const filesInfo = {};
      
      // Xử lý CCCD/CMND
      if (files.identityCardImage) {
        filesInfo.identityCardImages = files.identityCardImage.map(file => ({
          filename: file.filename,
          path: `/uploads/documents/${file.filename}`,
          originalname: file.originalname,
          size: file.size
        }));
      }
      
      // Xử lý giấy phép kinh doanh
      if (files.businessLicense) {
        filesInfo.businessLicense = {
          filename: files.businessLicense[0].filename,
          path: `/uploads/documents/${files.businessLicense[0].filename}`,
          originalname: files.businessLicense[0].originalname,
          size: files.businessLicense[0].size
        };
      }
      
      // Lưu thông tin vào cơ sở dữ liệu (nếu cần)
      // Ví dụ: Có thể tạo model ShopDocument để lưu thông tin giấy tờ
      
      res.status(200).json({
        message: "Documents uploaded successfully",
        files: filesInfo
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Lấy danh sách giấy tờ đã tải lên (chỉ admin)
 * GET /api/documents/list
 */
documentRouter.get(
  "/list",
  [VerifyJwt.verifyToken, VerifyJwt.isAdmin],
  async (req, res, next) => {
    try {
      // Đảm bảo thư mục tồn tại
      if (!fs.existsSync(documentUploadPath)) {
        fs.mkdirSync(documentUploadPath, { recursive: true });
        return res.status(200).json([]);
      }
      
      fs.readdir(documentUploadPath, (err, files) => {
        if (err) {
          throw createHttpError.InternalServerError("Error reading document directory");
        }
        
        const documentFiles = files.map(file => ({
          filename: file,
          path: `/uploads/documents/${file}`,
          uploadedAt: fs.statSync(path.join(documentUploadPath, file)).mtime
        }));
        
        res.status(200).json(documentFiles);
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Xóa giấy tờ đã tải lên (chỉ admin)
 * DELETE /api/documents/:filename
 */
documentRouter.delete(
  "/:filename",
  [VerifyJwt.verifyToken, VerifyJwt.isAdmin],
  async (req, res, next) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(documentUploadPath, filename);
      
      // Kiểm tra file tồn tại
      if (!fs.existsSync(filePath)) {
        throw createHttpError.NotFound("File not found");
      }
      
      // Xóa file
      fs.unlinkSync(filePath);
      
      // Xóa thông tin từ database nếu có
      
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = documentRouter;