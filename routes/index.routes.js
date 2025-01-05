const AccountRouter = require("./Account.routes");
const ProductRouter = require("./Product.routes");
const CartRouter = require("./Cart.routes");

const express = require("express");
const router = express.Router();

router.use("/products", ProductRouter);
router.use("/account", AccountRouter);
router.use("/cart", CartRouter);

module.exports = router;
