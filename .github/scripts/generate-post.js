import fetch from 'node-fetch';

const KEY = process.env.OPENROUTER_API_KEY;
const DB_URL = process.env.SUPABASE_URL;
const DB_KEY = process.env.SUPABASE_KEY;

const prompt = `ÛŒÚ© Ù…Ù‚Ø§Ù„Ù‡ Ú©Ø§Ù…Ù„ ÙØ§Ø±Ø³ÛŒ Ø¯Ø±Ø¨Ø§Ø±Ù‡ ØªÚ©Ù†ÙˆÙ„ÙˆÚ˜ÛŒ Ø¨Ù†ÙˆÛŒØ³. Ù…ÙˆØ¶ÙˆØ¹: Ù‡ÙˆØ´ Ù…ØµÙ†ÙˆØ¹ÛŒ ÛŒØ§ Ø±Ø¨Ø§ØªÛŒÚ© ÛŒØ§ ÙØ¶Ø§ ÛŒØ§ Ø§Ù…Ù†ÛŒØª Ø³Ø§ÛŒØ¨Ø±ÛŒ. ÙÙ‚Ø· JSON Ø¨Ø¯Ù‡: {"title":"Ø¹Ù†ÙˆØ§Ù†","body":"Ù¾Ø§Ø±Ø§Ú¯Ø±Ø§Ù Ø§ÙˆÙ„\n\nÙ¾Ø§Ø±Ø§Ú¯Ø±Ø§Ù Ø¯ÙˆÙ…\n\nÙ¾Ø§Ø±Ø§Ú¯Ø±Ø§Ù Ø³ÙˆÙ…\n\nÙ¾Ø§Ø±Ø§Ú¯Ø±Ø§Ù Ú†Ù‡Ø§Ø±Ù…"}`;

async function run() {
  console.log('Calling OpenRouter...');

  const r1 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + KEY,
      'HTTP-Referer': 'https://omidam86.github.io/BandW',
      'X-Title': 'BandW Blog'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500
    })
  });

  if (!r1.ok) {
    const e = await r1.text();
    throw new Error('OpenRouter: ' + e);
  }

  const d1 = await r1.json();
  let text = d1.choices[0].message.content.trim();
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  text = text.replace(/```json|```/g, '').trim();

  const post = JSON.parse(text);
  console.log('Generated: ' + post.title);

  const r2 = await fetch(DB_URL + '/rest/v1/posts', {
    method: 'POST',
    headers: {
      'apikey': DB_KEY,
      'Authorization': 'Bearer ' + DB_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      title: post.title,
      body: post.body,
      category: 'ØªÚ©Ù†ÙˆÙ„ÙˆÚ˜ÛŒ',
      status: 'published',
      is_best: false,
      view_count: 0
    })
  });

  if (!r2.ok) {
    const e = await r2.text();
    throw new Error('Supabase: ' + e);
  }

  console.log('Published: ' + post.title);
}

run().catch(e => { console.error(e.message); process.exit(1); });
