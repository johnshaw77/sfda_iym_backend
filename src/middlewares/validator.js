const Joi = require("joi");
const { AppError } = require("./errorHandler");

/**
 * 用戶註冊資料驗證規則
 */
exports.registerValidation = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      "string.min": "用戶名至少需要 3 個字符",
      "string.max": "用戶名不能超過 30 個字符",
      "any.required": "用戶名為必填項",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "請輸入有效的電子郵件地址",
      "any.required": "電子郵件為必填項",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "密碼至少需要 6 個字符",
      "any.required": "密碼為必填項",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "確認密碼必須與密碼相同",
        "any.required": "確認密碼為必填項",
      }),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new AppError(
        error.details.map((detail) => detail.message).join(", "),
        400
      )
    );
  }
};

/**
 * 用戶登入資料驗證規則
 */
exports.loginValidation = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "請輸入有效的電子郵件地址",
      "any.required": "電子郵件為必填項",
    }),
    password: Joi.string().required().messages({
      "any.required": "密碼為必填項",
    }),
    remember: Joi.boolean(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new AppError(
        error.details.map((detail) => detail.message).join(", "),
        400
      )
    );
  }
};

/**
 * 更新用戶資料驗證規則
 */
exports.updateUserValidation = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).messages({
      "string.min": "用戶名至少需要 3 個字符",
      "string.max": "用戶名不能超過 30 個字符",
    }),
    email: Joi.string().email().messages({
      "string.email": "請輸入有效的電子郵件地址",
    }),
    currentPassword: Joi.string()
      .min(6)
      .when("newPassword", {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "string.min": "當前密碼至少需要 6 個字符",
        "any.required": "更改密碼時需要提供當前密碼",
      }),
    newPassword: Joi.string().min(6).messages({
      "string.min": "新密碼至少需要 6 個字符",
    }),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .when("newPassword", {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "any.only": "確認密碼必須與新密碼相同",
        "any.required": "更改密碼時需要確認新密碼",
      }),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new AppError(
        error.details.map((detail) => detail.message).join(", "),
        400
      )
    );
  }
};

/**
 * 創建專案資料驗證規則
 */
exports.createProjectValidation = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(1).max(100).messages({
      "string.min": "專案名稱不能為空",
      "string.max": "專案名稱不能超過 100 個字符",
      "any.required": "專案名稱為必填項",
    }),
    description: Joi.string().max(500).allow("").optional().messages({
      "string.max": "專案描述不能超過 500 個字符",
    }),
    status: Joi.string()
      .valid("draft", "in_progress", "completed", "cancelled")
      .default("draft")
      .messages({
        "any.only": "無效的專案狀態",
      }),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new AppError(
        error.details.map((detail) => detail.message).join(", "),
        400
      )
    );
  }
};

/**
 * 通用驗證中間件
 */
exports.validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      next(
        new AppError(
          error.details.map((detail) => detail.message).join(", "),
          400
        )
      );
    }
  };
};
