import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import customerRoutes from "./routes/customer.js"
import quotationRoutes from "./routes/quotation.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/quotations", quotationRoutes)

app.get("/", (req, res) => {
  res.json({ message: "PayZelo API is running" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})