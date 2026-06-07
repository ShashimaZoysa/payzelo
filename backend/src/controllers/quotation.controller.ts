import { Response } from "express"
import { AuthRequest } from "../middleware/auth.middleware.js"
import prisma from "../lib/prisma.js"

export const getQuotations = async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user?.businessId

    const quotations = await prisma.quotation.findMany({
      where: { businessId: String(businessId), isDeleted: false },
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
    })

    res.status(200).json({ quotations })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const getQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const businessId = req.user?.businessId

    const quotation = await prisma.quotation.findFirst({
      where: { id: String(id), businessId: String(businessId), isDeleted: false },
      include: { customer: true, items: true },
    })

    if (!quotation) {
      res.status(404).json({ message: "Quotation not found" })
      return
    }

    res.status(200).json({ quotation })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const createQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items, discount, tax, notes, expiryDate } = req.body
    const businessId = req.user?.businessId
    const userId = req.user?.userId

    if (!customerId || !items || items.length === 0) {
      res.status(400).json({ message: "Customer and items are required" })
      return
    }

    // verify customer belongs to this business
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId: String(businessId), isDeleted: false },
    })

    if (!customer) {
      res.status(404).json({ message: "Customer not found" })
      return
    }

    // calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
    const discountAmount = discount || 0
    const taxAmount = tax || 0
    const total = subtotal - discountAmount + taxAmount

    // generate quotation number with row lock to avoid duplicates
    const business = await prisma.business.update({
      where: { id: String(businessId) },
      data: { lastQuotationNumber: { increment: 1 } },
    })

    const quotationNumber = `QUO-${String(business.lastQuotationNumber).padStart(3, "0")}`

    const quotation = await prisma.quotation.create({
      data: {
        businessId: String(businessId),
        customerId,
        quotationNumber,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes,
        createdByUserId: userId!,
        updatedByUserId: userId!,
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, customer: true },
    })

    // audit trail
    await prisma.auditLog.create({
      data: {
        businessId: String(businessId),
        userId: userId!,
        action: "CREATED_QUOTATION",
        details: `${quotationNumber} created for ${customer.name}`,
      },
    })

    res.status(201).json({ message: "Quotation created", quotation })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const updateQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { items, discount, tax, notes, expiryDate, status } = req.body
    const businessId = req.user?.businessId
    const userId = req.user?.userId

    const existing = await prisma.quotation.findFirst({
      where: { id: String(id), businessId: String(businessId), isDeleted: false },
    })

    if (!existing) {
      res.status(404).json({ message: "Quotation not found" })
      return
    }

    // recalculate totals if items changed
    const subtotal = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
    const discountAmount = discount || 0
    const taxAmount = tax || 0
    const total = subtotal - discountAmount + taxAmount

    // delete old items and recreate
    await prisma.quotationItem.deleteMany({ where: { quotationId: id } })

    const quotation = await prisma.quotation.update({
      where: { id: String(id) },
      data: {
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes,
        status,
        updatedByUserId: userId!,
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, customer: true },
    })

    await prisma.auditLog.create({
      data: {
        businessId: String(businessId),
        userId: userId!,
        action: "UPDATED_QUOTATION",
        details: `${existing.quotationNumber} updated`,
      },
    })

    res.status(200).json({ message: "Quotation updated", quotation })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const deleteQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const businessId = req.user?.businessId
    const userId = req.user?.userId

    const existing = await prisma.quotation.findFirst({
      where: { id: String(id), businessId: String(businessId), isDeleted: false },
    })

    if (!existing) {
      res.status(404).json({ message: "Quotation not found" })
      return
    }

    // soft delete
    await prisma.quotation.update({
      where: { id: String(id) },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedByUserId: userId!,
      },
    })

    await prisma.auditLog.create({
      data: {
        businessId: String(businessId),
        userId: userId!,
        action: "DELETED_QUOTATION",
        details: `${existing.quotationNumber} deleted`,
      },
    })

    res.status(200).json({ message: "Quotation deleted" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

// convert accepted quotation to invoice
export const convertToInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { dueDate } = req.body
    const businessId = req.user?.businessId
    const userId = req.user?.userId

    if (!dueDate) {
      res.status(400).json({ message: "Due date is required" })
      return
    }

    const quotation = await prisma.quotation.findFirst({
      where: { id: String(id), businessId: String(businessId), isDeleted: false },
      include: { items: true, invoice: true },
    })

    if (!quotation) {
      res.status(404).json({ message: "Quotation not found" })
      return
    }

    if (quotation.invoice) {
      res.status(400).json({ message: "Quotation already converted to invoice" })
      return
    }

    // generate invoice number
    const business = await prisma.business.update({
      where: { id: String(businessId) },
      data: { lastInvoiceNumber: { increment: 1 } },
    })

    const invoiceNumber = `INV-${String(business.lastInvoiceNumber).padStart(3, "0")}`

    const invoice = await prisma.invoice.create({
      data: {
        businessId: String(businessId),
        customerId: quotation.customerId,
        quotationId: quotation.id,
        invoiceNumber,
        customerName: quotation.customerName,
        customerPhone: quotation.customerPhone,
        customerAddress: quotation.customerAddress,
        subtotal: quotation.subtotal,
        discount: quotation.discount,
        tax: quotation.tax,
        total: quotation.total,
        balance: quotation.total,
        dueDate: new Date(dueDate),
        createdByUserId: userId!,
        updatedByUserId: userId!,
        items: {
          create: quotation.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    })

    // mark quotation as converted
    await prisma.quotation.update({
      where: { id: String(id) },
      data: { status: "CONVERTED", updatedByUserId: userId! },
    })

    await prisma.auditLog.create({
      data: {
        businessId: String(businessId),
        userId: userId!,
        action: "CONVERTED_QUOTATION",
        details: `${quotation.quotationNumber} converted to ${invoiceNumber}`,
      },
    })

    res.status(201).json({ message: "Quotation converted to invoice", invoice })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}