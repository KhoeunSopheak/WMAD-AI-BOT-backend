import { TokenPayload } from "../common/types/user";
import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { RoleEnum, RoleType } from "../common";
import { UserModel } from "../models/user.model";

const protectRoute = (roles: RoleType[] = [RoleEnum[0]]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as TokenPayload;
      req.user = decoded;

      if (!roles.includes(decoded.role)) {
        res.status(403).json({ message: "Forbidden: You do not have the right role" });
        return;
      }

      next();
    } catch (err) {
      console.error("JWT Error:", err);
      res.status(401).json({ message: "Invalid token" });
      return;
    }
  };
};

export default protectRoute;

export const blockIfDisabled = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id; // Get user ID from decoded token (set in protectRoute)
  const userModel = new UserModel();

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: No user found in token" });
    return;
  }
  await userModel.isUserBlocked(userId);
  const isDisabled = await userModel.isUserDisabled(userId);
  if (isDisabled) {
    res.status(403).json({ message: "Access denied. Your account is disabled." });
    return;
  }

  next();
};


