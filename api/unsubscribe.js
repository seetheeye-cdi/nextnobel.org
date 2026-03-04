import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET: email unsubscribe link click
  if (req.method === "GET") {
    const email = req.query.email;
    if (!email) return res.status(400).send("Missing email parameter");

    const normalized = decodeURIComponent(email).toLowerCase().trim();
    try {
      await redis.srem("subscribers", normalized);
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(`<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Unsubscribed</title></head>
<body style="font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#FCFBF9;margin:0;">
  <div style="text-align:center;max-width:400px;padding:24px;">
    <p style="font-family:Georgia,serif;font-size:22px;color:#1A1A1A;margin-bottom:12px;">NextNobel</p>
    <p style="font-size:15px;color:#444;line-height:1.6;">구독이 해지되었습니다.</p>
    <a href="https://nextnobel.org" style="font-size:13px;color:#AAA;text-decoration:none;margin-top:24px;display:inline-block;">nextnobel.org &rarr;</a>
  </div>
</body>
</html>`);
    } catch (error) {
      console.error("Unsubscribe GET error:", error.message);
      return res.status(500).send("Failed to unsubscribe");
    }
  }

  // POST: programmatic unsubscribe
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const normalized = email.toLowerCase().trim();
  try {
    await redis.srem("subscribers", normalized);
    return res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Unsubscribe error:", error.message);
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }
}
