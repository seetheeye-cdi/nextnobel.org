import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const normalized = email.toLowerCase().trim();

  try {
    const exists = await redis.sismember("subscribers", normalized);
    if (exists) return res.status(200).json({ message: "Already subscribed" });

    await redis.sadd("subscribers", normalized);
    return res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscribe error:", error.message);
    return res.status(500).json({ error: "Failed to subscribe" });
  }
}
