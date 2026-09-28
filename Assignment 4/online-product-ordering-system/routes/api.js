const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

const validateProduct = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Invalid product name"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0.01 }).withMessage("Price must be greater than 0"),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("category").trim().notEmpty().withMessage("Category is required")
];

router.get("/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: products.length, data: products });
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch { res.status(400).json({ success: false, message: "Invalid product ID" }); }
});

router.post("/products", isAuthenticated, isAdmin, validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const product = await Product.create({
    name: req.body.name, description: req.body.description, price: req.body.price,
    quantity: req.body.quantity, category: req.body.category, image: req.body.image || ""
  });
  res.status(201).json({ success: true, message: "Product created", data: product });
});

router.put("/products/:id", isAuthenticated, isAdmin, validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, {
      name: req.body.name, description: req.body.description, price: req.body.price,
      quantity: req.body.quantity, category: req.body.category, image: req.body.image || ""
    }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product updated", data: product });
  } catch { res.status(400).json({ success: false, message: "Invalid product ID" }); }
});

router.delete("/products/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch { res.status(400).json({ success: false, message: "Invalid product ID" }); }
});

module.exports = router;