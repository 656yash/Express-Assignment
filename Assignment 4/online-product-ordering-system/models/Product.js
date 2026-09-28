const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  price: { type: Number, required: true, min: 0.01 },
  quantity: { type: Number, required: true, min: 0, validate: { validator: Number.isInteger, message: "Quantity must be an integer" } },
  category: { type: String, required: true, trim: true },
  image: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);