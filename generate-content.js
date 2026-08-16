/**
 * generate-content.js
 * Calls the Claude API (with the web_search tool) to research the day's
 * freight forwarding / ocean / air cargo news, and writes a fresh data.json
 * for the portal (index.html) to render.
 *
 * Requires: ANTHROPIC_API_KEY environment variable.
 * Run: node generate-content.js
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY environment variable.');
  process.exit(1);
}

const SYSTEM_PROMPT = `You are a research assistant for a freight-forwarding / logistics LinkedIn page called Logisticiti.
Search the web for what has happened in the last 24-48 hours in: freight forwarding, ocean shipping, air freight/air cargo,
customs & trade policy affecting shippers, and major carrier/forwarder company news.

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:

{
  "items": [
    {
      "code": "MKT-001",            // short code: MKT- for market/trend news, ADV- for press releases/advisories/company news, OPN- for expert opinion/analysis
      "category": "market",         // one of: "market", "advisory", "opinion"
      "title": "string, under 90 chars, plain and specific",
      "summary": "2-3 sentences IN YOUR OWN WORDS, never copied text from the source, describing what happened and why it matters to a freight forwarder or shipper",
      "source": "Publication or company name",
      "url": "https://... the real source URL you found",
      "date": "YYYY-MM-DD"
    }
  ]
}

Rules:
- 8 to 12 items total, a mix across all three categories.
- Only include items you actually found via search, with real working source URLs. Never invent a URL.
- Never quote source text directly — always paraphrase in fresh wording.
- Prioritize the most recent and most consequential items for someone in freight forwarding, ocean, or air cargo.`;

async function generate() {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: 'Research today\'s freight forwarding, ocean, and air cargo news and return the JSON now.' }
      ],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // The model may emit multiple content blocks (search calls + text). Grab the text blocks.
  const textBlocks = data.content.filter(b => b.type === 'text').map(b => b.text);
  const raw = textBlocks.join('\n').trim();

  // Strip accidental code fences if present.
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Could not parse model output as JSON:\n', cleaned);
    throw err;
  }

  const output = {
    last_synced: new Date().toISOString(),
    items: parsed.items
  };

  const outPath = path.join(__dirname, 'data.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${parsed.items.length} items to ${outPath}`);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
