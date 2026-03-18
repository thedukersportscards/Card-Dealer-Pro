export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, mediaType } = req.body;

  if (!base64 || !mediaType) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 }
            },
            {
              type: 'text',
              text: `You are a sports card expert. Identify this card and respond ONLY with a raw JSON object, no markdown, no backticks, no explanation:
{"name":"Player full name","year":"4-digit year","set":"Brand and set name","parallel":"Parallel or variant name, empty string if base","cardNum":"Card number with # prefix or serial number like #02/25, empty if none","sport":"Football|Basketball|Baseball|Hockey|Soccer|Other","notes":"Brief condition and eye appeal note, mention autograph if present, note any serial numbering"}
If not a sports card: {"name":"Unknown","year":"","set":"","parallel":"","cardNum":"","sport":"Other","notes":"Could not identify as sports card"}`
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.find(b => b.type === 'text')?.text;
    if (!text) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: 'Could not parse card data' });
    }

    const card = JSON.parse(match[0]);
    return res.status(200).json(card);

  } catch (err) {
    console.error('Identify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
