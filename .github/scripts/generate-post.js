import fetch from 'node-fetch';
const KEY = process.env.OPENROUTER_API_KEY;
const DB_URL = process.env.SUPABASE_URL;
const DB_KEY = process.env.SUPABASE_KEY;
const prompt = `تاریخ امروز: ${new Date().toLocaleDateString('fa-IR')}

یکی از این موضوعات رو به صورت تصادفی انتخاب کن: تراشه‌های پردازنده، هوش مصنوعی، خودروهای برقی، سیستم‌عامل‌ها

درباره یک خبر مشخص و واقعی از همین هفته در اون موضوع، یک مقاله خبری-تحلیلی فارسی بنویس.

شرایط مقاله:
- روی یک خبر یا رویداد مشخص تمرکز کن، نه کلی‌گویی
- لحن جذاب، روان و خبری داشته باشد
- دقیقاً ۶ پاراگراف، هر پاراگراف ۳ تا ۴ جمله
- با جزئیات واقعی مثل نام شرکت، مدل محصول، عدد و آمار

فقط JSON بده بدون هیچ توضیح اضافه:
{"title":"عنوان خبری جذاب","body":"پاراگراف اول\n\nپاراگراف دوم\n\nپاراگراف سوم\n\nپاراگراف چهارم\n\nپاراگراف پنجم\n\nپاراگراف ششم"}`;
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
      model: 'deepseek/deepseek-chat-v3-0324',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500
    })
  });
  if (!r1.ok) { const e = await r1.text(); throw new Error('OpenRouter: ' + e); }
  const d1 = await r1.json();
  let text = d1.choices[0].message.content.trim();
  text = text.replace(/```json|```/g, '').trim();
  const post = JSON.parse(text);
  console.log('Generated: ' + post.title);
  const r2 = await fetch(DB_URL + '/rest/v1/posts', {
    method: 'POST',
    headers: { 'apikey': DB_KEY, 'Authorization': 'Bearer ' + DB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify({ title: post.title, body: post.body, category: 'تکنولوژی', status: 'published', is_best: false, view_count: 0 })
  });
  if (!r2.ok) { const e = await r2.text(); throw new Error('Supabase: ' + e); }
  console.log('Published: ' + post.title);
}
run().catch(e => { console.error(e.message); process.exit(1); });
