import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { RoleType, TokenPayload } from "../common";
import { generateToken } from "../utils/encrypt";
import { v4 as uuidv4 } from "uuid";


// export const register = async (req: Request, res: Response) => {
//   const { full_name, email, role, password } = req.body;
//   const id = uuidv4();
//   const created_at = new Date();
//   const updated_at = new Date();

//   try {
//     const userModel = new UserModel({
//       id,
//       full_name,
//       email,
//       role,
//       password,
//       created_at,
//       updated_at,
//     });

//     const existingUser = await userModel.findByEmail(email);
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     await userModel.register();

//     return res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const userModel = new UserModel();

//   try {
//     const { isValid, user } = await userModel.validateLogin(email, password);
//     if (!isValid || !user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const tokenPayload: TokenPayload = { 
//       id: user.id || "",
//       role: user.role as RoleType,
//     };

//     const token = generateToken(tokenPayload);

//     return res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const register = async (req: Request, res: Response) => {
  const { full_name, email, role, password } = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  try {
    const userModel = new UserModel({
      id,
      full_name,
      email,
      role,
      password,
      created_at,
      updated_at,
    });

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    await userModel.register();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export const login = async (req: Request, res: Response) => { }

