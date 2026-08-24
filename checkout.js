document.addEventListener("DOMContentLoaded", function () {

    const cart =
        JSON.parse(localStorage.getItem("meatShopCart")) || [];

    const itemsContainer =
        document.getElementById("checkout-items");

    let subtotal = 0;


    /* =========================
       SHOW CART ITEMS
    ========================= */

    if (cart.length === 0) {

        itemsContainer.innerHTML = `
            <div class="empty-checkout">
                <p>Your cart is empty.</p>
            </div>
        `;

    } else {

        cart.forEach(function (item) {

            const itemTotal =
                Number(item.price || 0) * Number(item.quantity || 0);

            subtotal += itemTotal;

            const itemElement =
                document.createElement("div");

            itemElement.className =
                "checkout-item";

            itemElement.innerHTML = `

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

                <div class="checkout-item-info">

                    <strong>
                        ${item.name}
                    </strong>

                    <span>
                        ${item.weight} × ${item.quantity}
                    </span>

                </div>

                <strong>
                    ₹${itemTotal}
                </strong>

            `;

            itemsContainer.appendChild(
                itemElement
            );

        });

    }


    /* =========================
       DELIVERY
    ========================= */

    let delivery = 0;

    if (subtotal > 0 && subtotal < 500) {
        delivery = 40;
    }

    const total =
        subtotal + delivery;


    document.getElementById(
        "checkout-subtotal"
    ).textContent =
        "₹" + subtotal;


    document.getElementById(
        "checkout-delivery"
    ).textContent =
        delivery === 0
            ? "FREE"
            : "₹" + delivery;


    document.getElementById(
        "checkout-total"
    ).textContent =
        "₹" + total;



    /* =========================
       PLACE ORDER
    ========================= */

    const placeOrderButton =
        document.getElementById("place-order");


    placeOrderButton.addEventListener(
        "click",
        async function () {

            /* =========================
               CUSTOMER DETAILS
            ========================= */

            const name =
                document
                    .getElementById("customer-name")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("customer-phone")
                    .value
                    .trim();


            const address =
                document
                    .getElementById("customer-address")
                    .value
                    .trim();


            const city =
                document
                    .getElementById("customer-city")
                    .value
                    .trim();


            const pincode =
                document
                    .getElementById("customer-pincode")
                    .value
                    .trim();


            const payment =
                document.querySelector(
                    'input[name="payment"]:checked'
                );



            /* =========================
               VALIDATION
            ========================= */

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            if (!name) {

                alert(
                    "Please enter your full name."
                );

                document
                    .getElementById("customer-name")
                    .focus();

                return;

            }


            if (!phone) {

                alert(
                    "Please enter your phone number."
                );

                document
                    .getElementById("customer-phone")
                    .focus();

                return;

            }


            if (!/^[0-9]{10}$/.test(phone)) {

                alert(
                    "Please enter a valid 10-digit phone number."
                );

                document
                    .getElementById("customer-phone")
                    .focus();

                return;

            }


            if (!address) {

                alert(
                    "Please enter your delivery address."
                );

                document
                    .getElementById("customer-address")
                    .focus();

                return;

            }


            if (!city) {

                alert(
                    "Please enter your city."
                );

                document
                    .getElementById("customer-city")
                    .focus();

                return;

            }


            if (!/^[0-9]{6}$/.test(pincode)) {

                alert(
                    "Please enter a valid 6-digit pincode."
                );

                document
                    .getElementById("customer-pincode")
                    .focus();

                return;

            }


            if (!payment) {

                alert(
                    "Please select a payment method."
                );

                return;

            }



            /* =========================
               PREVENT DOUBLE CLICK
            ========================= */

            placeOrderButton.disabled = true;

            placeOrderButton.textContent =
                "Placing Order...";


            /* =========================
               OPEN WHATSAPP WINDOW EARLY
               This prevents popup blocking
            ========================= */

            let whatsappWindow = null;

            try {

                whatsappWindow =
                    window.open(
                        "about:blank",
                        "_blank"
                    );

            } catch (error) {

                console.log(
                    "WhatsApp window could not be opened yet."
                );

            }



            /* =========================
               ORDER DATA
            ========================= */

            const orderData = {

                customer: {

                    name: name,

                    phone: phone,

                    address: address,

                    city: city,

                    pincode: pincode

                },

                paymentMethod:
                    payment.value,

                items: cart,

                subtotal: subtotal,

                delivery: delivery,

                total: total

            };



            /* =========================
               SEND ORDER TO BACKEND
            ========================= */

            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/orders",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    orderData
                                )
                        }
                    );


                const result =
                    await response.json();



                /* =========================
                   BACKEND ERROR
                ========================= */

                if (!response.ok || !result.success) {

                    throw new Error(
                        result.message ||
                        "Unable to place order."
                    );

                }



                /* =========================
                   SAVE BACKEND ORDER
                ========================= */

                const backendOrder =
                    result.order;


                const successOrder = {

                    orderNumber:
                        backendOrder.orderId,

                    customer:
                        backendOrder.customer,

                    paymentMethod:
                        backendOrder.paymentMethod,

                    items:
                        backendOrder.items,

                    subtotal:
                        backendOrder.subtotal,

                    delivery:
                        backendOrder.delivery,

                    total:
                        backendOrder.total,

                    orderDate:
                        backendOrder.createdAt

                };


                localStorage.setItem(
                    "meatShopLastOrder",
                    JSON.stringify(
                        successOrder
                    )
                );



                /* =========================
                   CREATE WHATSAPP MESSAGE
                ========================= */

                let whatsappMessage =
                    "🛒 *NEW ORDER - OFFER CHICKEN*";

                whatsappMessage +=
                    "\n\n";

                whatsappMessage +=
                    "📦 *Order ID:* " +
                    backendOrder.orderId;

                whatsappMessage +=
                    "\n\n";

                whatsappMessage +=
                    "👤 *Customer Details*";

                whatsappMessage +=
                    "\nName: " + name;

                whatsappMessage +=
                    "\nPhone: " + phone;

                whatsappMessage +=
                    "\nAddress: " + address;

                whatsappMessage +=
                    "\nCity: " + city;

                whatsappMessage +=
                    "\nPincode: " + pincode;

                whatsappMessage +=
                    "\n\n";

                whatsappMessage +=
                    "🛍️ *Ordered Items*";

                whatsappMessage +=
                    "\n";


                cart.forEach(function (item, index) {

                    const itemTotal =
                        Number(item.price || 0) *
                        Number(item.quantity || 0);

                    whatsappMessage +=
                        "\n" +
                        (index + 1) +
                        ". " +
                        item.name;

                    if (item.weight) {

                        whatsappMessage +=
                            " (" +
                            item.weight +
                            ")";

                    }

                    whatsappMessage +=
                        " × " +
                        item.quantity;

                    whatsappMessage +=
                        " = ₹" +
                        itemTotal;

                });


                whatsappMessage +=
                    "\n\n";

                whatsappMessage +=
                    "💰 *Subtotal:* ₹" +
                    subtotal;

                whatsappMessage +=
                    "\n🚚 *Delivery:* " +
                    (
                        delivery === 0
                            ? "FREE"
                            : "₹" + delivery
                    );

                whatsappMessage +=
                    "\n💵 *Total:* ₹" +
                    total;

                whatsappMessage +=
                    "\n💳 *Payment:* " +
                    (
                        payment.value === "cod"
                            ? "Cash on Delivery"
                            : "Online Payment"
                    );

                whatsappMessage +=
                    "\n\n";

                whatsappMessage +=
                    "Thank you for ordering from OFFER CHICKEN! ❤️";



                /* =========================
                   WHATSAPP URL
                ========================= */

                const whatsappNumber =
                    "919384997383";

                const whatsappURL =
                    "https://wa.me/" +
                    whatsappNumber +
                    "?text=" +
                    encodeURIComponent(
                        whatsappMessage
                    );



                /* =========================
                   OPEN WHATSAPP
                ========================= */

                if (
                    whatsappWindow &&
                    !whatsappWindow.closed
                ) {

                    whatsappWindow.location.href =
                        whatsappURL;

                } else {

                    window.open(
                        whatsappURL,
                        "_blank"
                    );

                }



                /* =========================
                   CLEAR CART
                ========================= */

                localStorage.removeItem(
                    "meatShopCart"
                );



                /* =========================
                   SUCCESS PAGE
                ========================= */

                setTimeout(function () {

                    window.location.href =
                        "order-success.html";

                }, 800);



            } catch (error) {

                console.error(
                    "Order submission error:",
                    error
                );


                if (
                    whatsappWindow &&
                    !whatsappWindow.closed
                ) {

                    whatsappWindow.close();

                }


                alert(
                    "Unable to place the order right now. Please make sure the backend server is running."
                );


                placeOrderButton.disabled =
                    false;


                placeOrderButton.textContent =
                    "Place Order";

            }

        }
    );

});