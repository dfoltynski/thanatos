import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { GITHUB_API_URL } from "../../constants";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { authorization } = req.headers;

    const response = await axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: authorization,
      },
    });

    if (response.status === 200) {
      next();
      return;
    }
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(401).json({ message: "Unauthorized" });
};
