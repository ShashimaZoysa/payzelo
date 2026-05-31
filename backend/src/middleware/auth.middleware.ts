import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt.js"

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
    businessId: string | null
  }
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
}

export const authorizeOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "OWNER" && req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "Access denied" })
    return
  }
  next()
}

export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "Access denied" })
    return
  }
  next()
}