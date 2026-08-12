// api/check-khqr-status.js
// Calls Bakong's Open API with your Bearer token (kept server-side only)
// to check whether a generated QR code has been paid.

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { md5 } = req.body;

    if (!md5) {
      return res.status(400).json({ error: "md5 is required" });
    }

    const bakongToken = process.env.BAKONG_TOKEN;
    if (!bakongToken) {
      return res.status(500).json({ error: "Bakong token not configured" });
    }

    // NOTE: verify this exact endpoint path against your Bakong developer
    // dashboard docs — API paths have changed across SDK/API versions.
    const response = await fetch(
      "https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bakongToken}`,
        },
        body: JSON.stringify({ md5 }),
      },
    );

    const data = await response.json();

    // Bakong typically returns responseCode 0 when the transaction is found/paid
    const isPaid = data?.responseCode === 0;

    return res.status(200).json({ paid: isPaid, raw: data });
  } catch (err) {
    console.error("check-khqr-status error:", err);
    return res.status(500).json({ error: "Internal error checking status" });
  }
};
