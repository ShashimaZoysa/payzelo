import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { BusinessStatus } from "@prisma/client"
import prisma from "../lib/prisma.js"
import { generateToken } from "../utils/jwt.js"

// Register a new business and owner account
export const register = async (req: Request, res: Response) => {
  try {
    const { businessName, name, email, password } = req.body

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(400).json({ message: "Email already in use" })
      return
    }

    // Get PRO plan
    const plan = await prisma.plan.findUnique({ where: { name: "PRO" } })
    if (!plan) {
      res.status(500).json({ message: "Plan not found" })
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Calculate trial end date
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    // Create business first with no owner
    const business = await prisma.business.create({
      data: {
        name: businessName,
        planId: plan.id,
        status: BusinessStatus.TRIAL,
        trialEndsAt,
      },
    })

    // Create owner user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "OWNER" as const,
        businessId: business.id,
      },
    })

    // Update business with owner
    await prisma.business.update({
      where: { id: business.id },
      data: { ownerUserId: user.id },
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      businessId: business.id,
    })

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      business: {
        id: business.id,
        name: business.name,
        status: business.status,
        trialEndsAt: business.trialEndsAt,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    })

    if (!user || user.isDeleted) {
      res.status(401).json({ message: "Invalid email or password" })
      return
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" })
      return
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      businessId: user.businessId,
    })

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      business: user.business
        ? {
            id: user.business.id,
            name: user.business.name,
            status: user.business.status,
            trialEndsAt: user.business.trialEndsAt,
          }
        : null,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

// Get current logged in user
export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    })

    if (!user || user.isDeleted) {
      res.status(404).json({ message: "User not found" })
      return
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      business: user.business
        ? {
            id: user.business.id,
            name: user.business.name,
            status: user.business.status,
            trialEndsAt: user.business.trialEndsAt,
          }
        : null,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}