const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  const orders = await Order.find({ user: req.session.user.id }).sort({ createdAt: -1 });
  res.render("orders", { orders, user: req.session.user });
});

router.post("/place", isAuthenticated, [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Invalid name").matches(/^[A-Za-z ]+$/).withMessage("Name can contain only letters and spaces"),
  body("email").trim().isEmail().withMessage("Invalid email").normalizeEmail(),
  body("mobile").trim().matches(/^[6-9][0-9]{9}$/).withMessage("Invalid mobile number"),
  body("address").trim().isLength({ min: 5, max: 250 }).withMessage("Invalid address")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render("error", { status: 400, message: errors.array()[0].msg });

  const cart = await Cart.findOne({ user: req.session.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) return res.status(400).render("error", { status: 400, message: "Your cart is empty" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderItems = [];
    let total = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);
      if (!product || product.quantity < item.quantity) throw new Error(`Insufficient stock for ${item.product.name}`);
      orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity });
      total += product.price * item.quantity;
      product.quantity -= item.quantity;
      await product.save({ session });
    }

    await Order.create([{
      user: req.session.user.id,
      items: orderItems,
      customer: { name: req.body.name, email: req.body.email, mobile: req.body.mobile, address: req.body.address },
      total: Number(total.toFixed(2))
    }], { session });

    await Cart.findOneAndUpdate({ user: req.session.user.id }, { items: [] }, { session });
    await User.findByIdAndUpdate(req.session.user.id, { name: req.body.name, mobile: req.body.mobile, address: req.body.address }, { session });

    await session.commitTransaction();
    session.endSession();
    res.redirect("/orders");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).render("error", { status: 400, message: err.message || "Order failed" });
  }
});

router.get("/admin", isAuthenticated, isAdmin, async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.render("admin-orders", { orders, user: req.session.user });
});

router.post("/admin/:id/status", isAuthenticated, isAdmin, [
  body("status").isIn(["Placed", "Processing", "Shipped", "Delivered", "Cancelled"]).withMessage("Invalid order status")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render("error", { status: 400, message: errors.array()[0].msg });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).render("error", { status: 404, message: "Order not found" });
  order.status = req.body.status;
  await order.save();
  res.redirect("/orders/admin");
});

module.exports = router;