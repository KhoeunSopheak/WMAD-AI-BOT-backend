import { TokenPayload } from "../common/types/user";
import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { RoleEnum, RoleType } from "../common";

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
