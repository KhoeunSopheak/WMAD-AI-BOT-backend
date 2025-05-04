import { TokenPayload } from '../common/types/user';
import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { RoleEnum, RoleType } from "../common";


const protectRoute = (roles: RoleType[] = [RoleEnum[0]]) => {
  return (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied, no token provided or invalid format",
      });
    } 

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as TokenPayload;
      req.user = decoded;

      if (!roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: You do not have the right role" });
      }

      next();
    } catch (err) {
      console.log("error: ", err)
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

export default protectRoute;