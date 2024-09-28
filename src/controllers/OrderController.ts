import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import Order from "../models/order";

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

type CreateOrderRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
  deliveryPrice?: number | null; // Allow deliveryPrice to be null
  accountName: string;
  accountNumber: string;
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const orderRequest: CreateOrderRequest = req.body;

    const restaurant = await Restaurant.findById(orderRequest.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Calculate the total amount
    const itemsTotal = orderRequest.cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Only add the delivery price if includeDelivery is true
    const deliveryPrice = orderRequest.deliveryPrice ?? 0; // Keep it 0 if not included
    const totalAmount = itemsTotal + deliveryPrice;

    // Create a new order
    const newOrder = new Order({
      restaurant: restaurant._id,
      user: req.userId,
      status: "placed",
      deliveryDetails: orderRequest.deliveryDetails,
      cartItems: orderRequest.cartItems,
      totalAmount, // Set the total amount
      ...(orderRequest.deliveryPrice && { deliveryPrice }), // Only include deliveryPrice if provided
      createdAt: new Date(),
      accountName: restaurant.accountName,
      accountNumber: restaurant.accountNumber,
    });

    // Save the new order to the database
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export default {
  getMyOrders,
  createOrder,
};
