// api/generate-khqr.js
// Runs server-side only — your Bakong Account ID and token never reach the browser.
const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, billNumber, currency } = req.body;

    if (!amount || !billNumber) {
      return res
        .status(400)
        .json({ error: "amount and billNumber are required" });
    }

    const bakongAccountId = process.env.BAKONG_ACCOUNT_ID;
    const merchantName = process.env.MERCHANT_NAME || "Prince Cinema";
    const merchantCity = process.env.MERCHANT_CITY || "Phnom Penh";

    if (!bakongAccountId) {
      return res.status(500).json({ error: "Bakong account not configured" });
    }

    const selectedCurrency =
      currency === "KHR" ? khqrData.currency.khr : khqrData.currency.usd;

    const optionalData = {
      currency: selectedCurrency,
      amount: Number(amount),
      billNumber: String(billNumber),
      storeLabel: "Prince Cinema",
      terminalLabel: "Web Checkout",
      // KHQR codes should time out — matches the 10-minute Bakong guideline
      expirationTimestamp: Date.now() + 10 * 60 * 1000,
    };

    const individualInfo = new IndividualInfo(
      bakongAccountId,
      merchantName,
      merchantCity,
      optionalData,
    );

    const khqr = new BakongKHQR();
    const response = khqr.generateIndividual(individualInfo);

    if (response?.status?.code !== 0) {
      return res.status(500).json({
        error: "Failed to generate KHQR",
        details: response?.status,
      });
    }

    return res.status(200).json({
      qr: response.data.qr,
      md5: response.data.md5,
    });
  } catch (err) {
    console.error("generate-khqr error:", err);
    return res.status(500).json({ error: "Internal error generating QR" });
  }
};
