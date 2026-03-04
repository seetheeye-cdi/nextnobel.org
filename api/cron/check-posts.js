import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
const resend = new Resend(process.env.RESEND_API_KEY);

async function fetchPostsFromInstagram() {
  const response = await fetch(
    "https://www.instagram.com/api/v1/users/web_profile_info/?username=nextnobel",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-IG-App-ID": "936619743392459",
      },
    }
  );

  if (!response.ok) throw new Error(`Instagram API returned ${response.status}`);

  const data = await response.json();
  const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges || [];

  return edges.slice(0, 12).map((edge) => {
    const node = edge.node;
    const captionEdges = node.edge_media_to_caption?.edges || [];
    const fullCaption = captionEdges[0]?.node?.text || "";
    const firstLine = fullCaption.split("\n")[0].replace(/^🏅/, "").trim();
    const isVideo = node.is_video;

    return {
      shortcode: node.shortcode,
      title: firstLine || "New Post",
      thumbnail: node.display_url,
      type: isVideo ? "REEL" : "POST",
      url: isVideo
        ? `https://www.instagram.com/reel/${node.shortcode}/`
        : `https://www.instagram.com/p/${node.shortcode}/`,
    };
  });
}

function buildEmailHtml(newPosts, subscriberEmail) {
  const postCards = newPosts
    .map(
      (post) => `
      <tr>
        <td style="padding:0 0 24px 0;">
          <a href="${post.url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align:top;padding-right:16px;">
                  <img src="${post.thumbnail}" alt="${post.title}" width="120" height="${post.type === "REEL" ? 160 : 120}" style="display:block;border-radius:6px;object-fit:cover;" />
                </td>
                <td style="vertical-align:top;">
                  <p style="font-family:Georgia,serif;font-size:18px;color:#1A1A1A;line-height:1.4;margin:0 0 8px 0;">${post.title}</p>
                  <p style="font-family:Arial,sans-serif;font-size:13px;color:#999;margin:0;">${post.type} &middot; @nextnobel</p>
                </td>
              </tr>
            </table>
          </a>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#FCFBF9;font-family:Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FCFBF9;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;">
          <tr>
            <td style="padding:0 0 32px 0;border-bottom:1px solid #E0DDD8;">
              <p style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#1A1A1A;margin:0;">NextNobel</p>
              <p style="font-family:Arial,sans-serif;font-size:12px;color:#999;margin:4px 0 0 0;letter-spacing:1px;text-transform:uppercase;">New Content</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 24px 0;">
              <p style="font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;margin:0;">새로운 게시글이 올라왔습니다.</p>
            </td>
          </tr>
          ${postCards}
          <tr>
            <td style="padding:16px 0 32px 0;">
              <a href="https://www.instagram.com/nextnobel/" target="_blank" rel="noopener noreferrer" style="font-family:Arial,sans-serif;font-size:13px;color:#1A1A1A;text-decoration:none;border-bottom:1px solid #1A1A1A;padding-bottom:2px;">Instagram에서 더 보기 &rarr;</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;border-top:1px solid #E0DDD8;">
              <p style="font-family:Arial,sans-serif;font-size:11px;color:#CCC;margin:0;">&copy; 2026 NextNobel &middot; nextnobel.org</p>
              <p style="font-family:Arial,sans-serif;font-size:11px;color:#CCC;margin:8px 0 0 0;">
                <a href="https://nextnobel.org/api/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" style="color:#AAA;text-decoration:none;">구독 취소</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const posts = await fetchPostsFromInstagram();

    if (posts.length === 0) {
      await redis.set("last_cron_run", new Date().toISOString());
      return res.status(200).json({ message: "No posts found", newPosts: 0 });
    }

    const newPosts = [];
    for (const post of posts) {
      const seen = await redis.sismember("seen_posts", post.shortcode);
      if (!seen) newPosts.push(post);
    }

    if (newPosts.length === 0) {
      await redis.set("last_cron_run", new Date().toISOString());
      return res.status(200).json({ message: "No new posts", newPosts: 0 });
    }

    const subscribers = await redis.smembers("subscribers");

    if (subscribers.length === 0) {
      for (const post of newPosts) await redis.sadd("seen_posts", post.shortcode);
      await redis.set("last_cron_run", new Date().toISOString());
      return res.status(200).json({ message: "No subscribers", newPosts: newPosts.length });
    }

    const subject =
      newPosts.length === 1
        ? `새 게시글: ${newPosts[0].title}`
        : `새 게시글 ${newPosts.length}개가 올라왔습니다`;

    const batchSize = 100;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const emails = batch.map((email) => ({
        from: "NextNobel <newsletter@nextnobel.org>",
        to: email,
        subject,
        html: buildEmailHtml(newPosts, email),
      }));
      await resend.batch.send(emails);
    }

    for (const post of newPosts) await redis.sadd("seen_posts", post.shortcode);
    await redis.set("last_cron_run", new Date().toISOString());

    return res.status(200).json({
      message: "Emails sent",
      newPosts: newPosts.length,
      subscribers: subscribers.length,
    });
  } catch (error) {
    console.error("Cron check-posts error:", error.message);
    return res.status(500).json({ error: "Cron job failed", details: error.message });
  }
}
