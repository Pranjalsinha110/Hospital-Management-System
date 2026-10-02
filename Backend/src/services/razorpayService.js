const Razorpay = require("razorpay");
const crypto = require("crypto");

// RAZORPAY CLIENT


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CREATE RAZORPAY ORDER


const createRazorpayOrder = async ({
    amount,
    currency = "INR",
    receipt
}) => {

    if (!amount || amount <= 0) {
        throw new Error("Invalid payment amount");
    }

    if (!receipt) {
        throw new Error("Payment receipt is required");
    }

    const order = await razorpay.orders.create({
        amount,
        currency,
        receipt,
        payment_capture: 1
    });

    return order;
};

// FETCH RAZORPAY ORDER


const fetchRazorpayOrder = async (orderId) => {

    if (!orderId) {
        throw new Error("Razorpay order ID is required");
    }

    const order =
        await razorpay.orders.fetch(orderId);

    return order;
};



// FETCH RAZORPAY PAYMENT

const fetchRazorpayPayment = async (paymentId) => {

    if (!paymentId) {
        throw new Error("Razorpay payment ID is required");
    }

    const payment =
        await razorpay.payments.fetch(paymentId);

    return payment;
};
// VERIFY RAZORPAY PAYMENT SIGNATURE

// VERIFY RAZORPAY PAYMENT SIGNATURE

const verifyPaymentSignature = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
}) => {

    if (
        !razorpayOrderId ||
        !razorpayPaymentId ||
        !razorpaySignature
    ) {
        return false;
    }

    const generatedSignature =
        crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpayOrderId}|${razorpayPaymentId}`
            )
            .digest("hex");


    // Signature length must match before
    // using timingSafeEqual()

    if (
        generatedSignature.length !==
        razorpaySignature.length
    ) {
        return false;
    }


    return crypto.timingSafeEqual(
        Buffer.from(generatedSignature, "utf8"),
        Buffer.from(razorpaySignature, "utf8")
    );
};

// EXPORT

module.exports = {
    createRazorpayOrder,
    fetchRazorpayOrder,
    fetchRazorpayPayment,
    verifyPaymentSignature
};