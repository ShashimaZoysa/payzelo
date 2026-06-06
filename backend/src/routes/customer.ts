import { Router } from "express"
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = Router()

// all customer routes require authentication
router.use(authenticate)

router.get("/", getCustomers)
router.get("/:id", getCustomer)
router.post("/", createCustomer)
router.put("/:id", updateCustomer)
router.delete("/:id", deleteCustomer)

export default router