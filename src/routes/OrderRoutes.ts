import express from "express";
import OrderController from "../controllers/OrderController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// POST to create an order
router.post("/", jwtCheck, jwtParse, OrderController.createOrder); // Changed to root for clarity

// GET to fetch user's orders
router.get("/my-orders", jwtCheck, jwtParse, OrderController.getMyOrders);

export default router;
