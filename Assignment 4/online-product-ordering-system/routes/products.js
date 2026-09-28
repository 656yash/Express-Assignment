const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

const productValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Product name must be 2-100 characters"),
  body("description").trim().isLength({ min: 3, max: 500 }).withMessage("Description is required"),
  body("price").isFloat({ min: 0.01 }).withMessage("Price must be greater than 0"),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("image").optional({ values: "falsy" }).isURL().withMessage("Image must be a valid URL")
];

router.get("/", isAuthenticated, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render("products", { products, user: req.session.user });
});

router.get("/add", isAuthenticated, isAdmin, (req, res) => res.render("product-form", { mode: "add", product: {}, errors: [] }));

router.post("/add", isAuthenticated, isAdmin, productValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render("product-form", { mode: "add", product: req.body, errors: errors.array() });
  await Product.create({
    name: req.body.name, description: req.body.description, price: req.body.price,
    quantity: req.body.quantity, category: req.body.category, image: req.body.image || ""
  });
  res.redirect("/products");
});

router.get("/edit/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).render("error", { status: 404, message: "Product not found" });
    res.render("product-form", { mode: "edit", product, errors: [] });
  } catch { res.status(400).render("error", { status: 400, message: "Invalid product ID" }); }
});

router.post("/edit/:id", isAuthenticated, isAdmin, productValidation, async (req, res) => {
  const errors = validationResult(req);
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).render("error", { status: 404, message: "Product not found" });
    if (!errors.isEmpty()) return res.status(400).render("product-form", { mode: "edit", product: { ...product.toObject(), ...req.body }, errors: errors.array() });
    Object.assign(product, {
      name: req.body.name, description: req.body.description, price: req.body.price,
      quantity: req.body.quantity, category: req.body.category, image: req.body.image || ""
    });
    await product.save();
    res.redirect("/products");
  } catch { res.status(400).render("error", { status: 400, message: "Unable to update product" }); }
});

router.post("/delete/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).render("error", { status: 404, message: "Product not found" });
    res.redirect("/products");
  } catch { res.status(400).render("error", { status: 400, message: "Invalid product ID" }); }
});

module.exports = router;