import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// 简化的验证码存储（生产环境应使用Redis）
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// 生成6位数验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function setupPhoneAuth(app: Express) {
  // 发送验证码
  app.post("/api/auth/send-code", async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber || !/^1\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number" });
      }

      const code = generateCode();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟过期

      verificationCodes.set(phoneNumber, { code, expiresAt });

      // 在开发环境中，将验证码打印到console
      console.log(`📱 Verification code for ${phoneNumber}: ${code}`);

      // 生产环境中，这里应该调用短信服务商API发送验证码
      // 例如：await sendSMS(phoneNumber, `您的验证码是：${code}，5分钟内有效`);

      res.json({ message: "Verification code sent successfully" });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  // 手机号登录
  app.post("/api/auth/phone-login", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;

      if (!phoneNumber || !code) {
        return res.status(400).json({ message: "Phone number and code are required" });
      }

      // 验证验证码
      const storedData = verificationCodes.get(phoneNumber);
      
      if (!storedData) {
        return res.status(400).json({ message: "验证码无效或已过期" });
      }

      if (storedData.expiresAt < Date.now()) {
        verificationCodes.delete(phoneNumber);
        return res.status(400).json({ message: "验证码已过期" });
      }

      if (storedData.code !== code) {
        return res.status(400).json({ message: "验证码错误" });
      }

      // 验证成功，删除验证码
      verificationCodes.delete(phoneNumber);

      // 查找或创建用户
      const users = await storage.getUserByPhone(phoneNumber);
      let userId: string;

      if (users.length > 0) {
        // 用户已存在
        userId = users[0].id;
      } else {
        // 创建新用户（手机号作为临时标识）
        const newUser = await storage.createUserWithPhone({
          phoneNumber,
          email: `${phoneNumber}@temp.joyjoin.com`, // 临时邮箱
          firstName: "用户",
          lastName: phoneNumber.slice(-4), // 使用手机号后4位
        });
        userId = newUser.id;
      }

      // 设置session
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Login failed" });
        }

        req.session.userId = userId;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Login failed" });
          }

          res.json({ 
            message: "Login successful",
            userId 
          });
        });
      });
    } catch (error) {
      console.error("Error during phone login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // 登出
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
}

// 认证中间件
export const isPhoneAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
