const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  }],
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true }
  },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"], default: "Placed" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);