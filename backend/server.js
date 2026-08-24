const express = require("express");
const cors = require("cors");

const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const PORT = 5000;


/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());


/* =========================
   HOME
========================= */

app.get("/", (req, res) => {

    res.json({
        message: "Meat Shop Backend is running successfully!"
    });

});


/* =========================
   ORDER ROUTES
========================= */

app.use(
    "/api/orders",
    orderRoutes
);


/* =========================
   PRODUCT ROUTES
========================= */

app.use(
    "/api/products",
    productRoutes
);


/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});