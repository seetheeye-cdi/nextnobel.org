export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1200");

  try {
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

    if (!response.ok) {
      throw new Error(`Instagram API returned ${response.status}`);
    }

    const data = await response.json();
    const edges =
      data?.data?.user?.edge_owner_to_timeline_media?.edges || [];

    const reels = edges
      .filter((edge) => edge.node.is_video)
      .slice(0, 6)
      .map((edge, i) => {
        const node = edge.node;
        const captionEdges =
          node.edge_media_to_caption?.edges || [];
        const fullCaption = captionEdges[0]?.node?.text || "";
        const firstLine = fullCaption.split("\n")[0].replace(/^🏅/, "").trim();

        return {
          id: i + 1,
          shortcode: node.shortcode,
          title: firstLine,
          type: "REEL",
          thumbnail: node.display_url,
          url: `https://www.instagram.com/reel/${node.shortcode}/`,
        };
      });

    res.status(200).json({ reels });
  } catch (error) {
    console.error("Instagram fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch reels", reels: [] });
  }
}
