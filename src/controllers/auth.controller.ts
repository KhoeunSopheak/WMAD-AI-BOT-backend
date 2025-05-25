import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { RoleType, TokenPayload } from "../common";
import { generateToken } from "../utils/encrypt";
import { v4 as uuidv4 } from "uuid";


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
      role: role as RoleType,
      password,
      created_at,
      updated_at,
    });

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    await userModel.register();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const userModel = new UserModel();
    const users = await userModel.findAllUser();

    res.status(200).json({ message: "Get all user successfully", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userModel = new UserModel();
    const user = await userModel.findById(id);

    if (!user) {
     res.status(404).json({ message: "User not found" });
     return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const totalAllUsers = async (req: Request, res: Response) => {
  try {
    const userModel = new UserModel();
    const total = await userModel.countAllUsers();

    res.status(200).json({ message: "Get total user successfully", total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const disableUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userModel = new UserModel();
    const disable = await userModel.disableUser(id);
    res.status(200).json({ message: "User disable successfully", disable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const enableUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userModel = new UserModel();
    const enable = await userModel.enableUser(id);

    res.status(200).json({ message: "Enable user successfully", enable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const disableUserBlock = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userModel = new UserModel();
    const disable = await userModel.isUserBlocked(id);
    res.status(200).json({ message: "User block disable successfully", disable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userModel = new UserModel();
    const disable = await userModel.deleteUser(id);

    res.status(200).json({ message: "Delete user successfully", disable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userModel = new UserModel();

  try {
    const { isValid, user } = await userModel.validateLogin(email, password);
    if (!isValid || !user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const tokenPayload: TokenPayload = {
      id: user.id || "",
      role: user.role as RoleType,
    };

    const token = generateToken(tokenPayload);
    res.status(200).json({ message: "Login successful", token, role: user.role, user_id: user.id });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const getUsersGroupedByDate = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      res.status(400).json({ message: "Start and end dates are required" });
      return;
    }

    const userModel = new UserModel();
    const data = await userModel.getUsersGroupedByDate(start as string, end as string);

    res.status(200).json({ message: "Get users grouped by date successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




