import { Response } from "express"
import { AuthRequest } from "../middleware/auth.middleware.js"
import prisma from "../lib/prisma.js"

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user?.businessId

    const customers = await prisma.customer.findMany({
      where: { businessId: String(businessId), isDeleted: false },
      orderBy: { createdAt: "desc" },
    })

    res.status(200).json({ customers })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const getCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const businessId = req.user?.businessId

    const customer = await prisma.customer.findFirst({
      where: { id: String(id), businessId: String(businessId), isDeleted: false },
    })

    if (!customer) {
      res.status(404).json({ message: "Customer not found" })
      return
    }

    res.status(200).json({ customer })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address } = req.body
    const businessId = req.user?.businessId
    const userId = req.user?.userId

    if (!name) {
      res.status(400).json({ message: "Customer name is required" })
      return
    }

    const customer = await prisma.customer.create({
      data: {
        businessId: businessId!,
        name,
        email,
        phone,
        address,
        createdByUserId: userId!,
        updatedByUserId: userId!,
      },
    })

    // audit trail
    await prisma.auditLog.create({
      data: {
        businessId: businessId!,
        userId: userId!,
        action: "CREATED_CUSTOMER",
        details: `${name} added`,
      },
    })

    res.status(201).json({ message: "Customer created", customer })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { name, email, phone, address } = req.body
    const businessId = req.user?.businessId
    const userId = req.user?.userId

    // verify ownership before update
    const existing = await prisma.customer.findFirst({
      where: { id: String(id), businessId: String(businessId), isDeleted: false },
    })

    if (!existing) {
      res.status(404).json({ message: "Customer not found" })
      return
    }

    const customer = await prisma.customer.update({
      where: { id: String(id) },
      data: { name, email, phone, address, updatedByUserId: userId! },
    })

    await prisma.auditLog.create({
      data: {
        businessId: businessId!,
        userId: userId!,
        action: "UPDATED_CUSTOMER",
        details: `${name} updated`,
      },
    })

    res.status(200).json({ message: "Customer updated", customer })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const businessId = req.user?.businessId
    const userId = req.user?.userId

    const existing = await prisma.customer.findFirst({
      where: { id: String(id), businessId: String(businessId), isDeleted: false },
    })

    if (!existing) {
      res.status(404).json({ message: "Customer not found" })
      return
    }

    await prisma.customer.update({
      where: { id: String(id) },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedByUserId: userId!,
      },
    })

    await prisma.auditLog.create({
      data: {
        businessId: businessId!,
        userId: userId!,
        action: "DELETED_CUSTOMER",
        details: `${existing.name} deleted`,
      },
    })

    res.status(200).json({ message: "Customer deleted" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}