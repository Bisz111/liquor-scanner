import fetch from "node-fetch";
import cheerio from "cheerio";

export default async function handler(req, res) {
  const { upc } = req.query;

  if (!upc) return res.status(400).json({ error: "UPC required" });

  try {
    const googleURL = `https://www.google.com/search?q=${upc}`;
    const response = await fetch(googleURL, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const text = await response.text();

    const $ = cheerio.load(text);
    const titles = $("h3").map((i, el) => $(el).text()).get();
    const firstTitle = titles[0] || "Unknown Item";

    // AI summary
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Give me a liquor description, tasting notes, and what it pairs well with for: ${firstTitle}`
        }]
      })
    });

    const ai = await openaiRes.json();
    const summary = ai.choices?.[0]?.message?.content || "No info.";

    res.json({
      title: firstTitle,
      description: summary,
      image: "https://via.placeholder.com/150",
      pairs: "Cheese, red meat, chocolate"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

