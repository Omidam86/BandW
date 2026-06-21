import fetch from 'node-fetch';

const KEY = process.env.OPENROUTER_API_KEY;
const DB_URL = process.env.SUPABASE_URL;
const DB_KEY = process.env.SUPABASE_KEY;

const TOPICS = [
  {category:'تکنولوژی', subcategory:'هوش مصنوعی', hint:'هوش مصنوعی و مدل‌های زبانی'},
  {category:'تکنولوژی', subcategory:'گوشی و تبلت', hint:'گوشی‌های هوشمند و تبلت'},
  {category:'تکنولوژی', subcategory:'لپ‌تاپ و کامپیوتر', hint:'لپ‌تاپ و تراشه‌های پردازنده'},
  {category:'تکنولوژی', subcategory:'امنیت سایبری', hint:'امنیت سایبری و هک'},
  {category:'تکنولوژی', subcategory:'خودروهای برقی', hint:'خودروهای الکتریکی'},
  {category:'علم', subcategory:'فضا و نجوم', hint:'فضا و اکتشافات نجومی'},
  {category:'علم', subcategory:'فیزیک و کوانتوم', hint:'فیزیک کوانتومی'},
];

const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

const prompt = `تاریخ امروز: ${new Date().toLocaleDateString('fa-IR')}

موضوع: ${topic.hint}

یک خبر مشخص و واقعی از این هفته درباره موضوع بالا انتخاب کن و یک مقاله خبری-تحلیلی فارسی بنویس.

شرایط:
- تاریخ خبر حتماً برای ۲۰۲۶ به بعد باشد
- زبان فارسی باشد
- روی یک رویداد یا محصول مشخص تمرکز کن
- لحن جذاب و روان
- دقیقاً ۶ پاراگراف، هر کدام ۳-۴ جمله
- جزئیات واقعی مثل نام شرکت، مدل، آمار

فقط JSON بده:
{"title":"عنوان جذاب","body":"پاراگراف اول\n\nپاراگراف دوم\n\nپاراگراف سوم\n\nپاراگراف چهارم\n\nپاراگراف پنجم\n\nپاراگراف ششم"}`;

async function run() {
  console.log('Topic: ' + topic.category + ' > ' + topic.subcategory);

  const r1 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + KEY,
      'HTTP-Referer': 'https://omidam86.github.io/BandW',
      'X-Title': 'BandW Blog'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000
    })
  });

  if (!r1.ok) { const e = await r1.text(); throw new Error('OpenRouter: ' + e); }

  const d1 = await r1.json();
  let text = d1.choices[0].message.content.trim();
  text = text.replace(/```json|```/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();

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
      category: topic.category,
      subcategory: topic.subcategory,
      status: 'published',
      is_ai: true,
      is_best: false,
      view_count: 0
    })
  });

  if (!r2.ok) { const e = await r2.text(); throw new Error('Supabase: ' + e); }
  console.log('Published: ' + post.title + ' [' + topic.category + ' > ' + topic.subcategory + ']');
}

run().catch(e => { console.error(e.message); process.exit(1); });
