import { Router } from "express"
import {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  convertToInvoice,
} from "../controllers/quotation.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = Router()

router.use(authenticate)

router.get("/", getQuotations)
router.get("/:id", getQuotation)
router.post("/", createQuotation)
router.put("/:id", updateQuotation)
router.delete("/:id", deleteQuotation)
router.post("/:id/convert", convertToInvoice)

export default router