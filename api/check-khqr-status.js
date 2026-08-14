export default async function handler(req, res) {
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
    const isPaid = data?.responseCode === 0;

    return res.status(200).json({ paid: isPaid, raw: data });
  } catch (err) {
    console.error("check-khqr-status error:", err);
    return res
      .status(500)
      .json({ error: "Internal error checking status", message: err.message });
  }
}
