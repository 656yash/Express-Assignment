const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  let cart = await Cart.findOne({ user: req.session.user.id }).populate("items.product");
  if (!cart) cart = { items: [] };
  const validItems = cart.items.filter(i => i.product);
  const total = validItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  res.render("cart", { cart: { ...cart.toObject?.(), items: validItems }, total, user: req.session.user });
});

router.post("/add", isAuthenticated, [
  body("productId").isMongoId().withMessage("Invalid product"),
  body("quantity").isInt({ min: 1, max: 100 }).withMessage("Quantity must be between 1 and 100")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render("error", { status: 400, message: errors.array()[0].msg });

  const product = await Product.findById(req.body.productId);
  if (!product) return res.status(404).render("error", { status: 404, message: "Product not found" });
  const qty = Number(req.body.quantity);
  if (product.quantity < qty) return res.status(400).render("error", { status: 400, message: "Insufficient stock" });

  let cart = await Cart.findOne({ user: req.session.user.id });
  if (!cart) cart = new Cart({ user: req.session.user.id, items: [] });

  const item = cart.items.find(i => i.product.toString() === product._id.toString());
  if (item) {
    if (item.quantity + qty > product.quantity) return res.status(400).render("error", { status: 400, message: "Requested quantity exceeds stock" });
    item.quantity += qty;
  } else {
    cart.items.push({ product: product._id, quantity: qty });
  }
  await cart.save();
  res.redirect("/cart");
});

router.post("/update/:productId", isAuthenticated, [
  body("quantity").isInt({ min: 1, max: 100 }).withMessage("Quantity must be between 1 and 100")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render("error", { status: 400, message: errors.array()[0].msg });

  const cart = await Cart.findOne({ user: req.session.user.id });
  const product = await Product.findById(req.params.productId);
  if (!cart || !product) return res.status(404).render("error", { status: 404, message: "Cart or product not found" });

  const item = cart.items.find(i => i.product.toString() === product._id.toString());
  if (!item) return res.status(404).render("error", { status: 404, message: "Cart item not found" });
  if (Number(req.body.quantity) > product.quantity) return res.status(400).render("error", { status: 400, message: "Quantity exceeds stock" });

  item.quantity = Number(req.body.quantity);
  await cart.save();
  res.redirect("/cart");
});

router.post("/remove/:productId", isAuthenticated, async (req, res) => {
  const cart = await Cart.findOne({ user: req.session.user.id });
  if (cart) {
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
  }
  res.redirect("/cart");
});

module.exports = router;