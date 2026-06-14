const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function generatePost() {
  const today = new Date().toLocaleDateString('fa-IR');

  const prompt = `یک مقاله کامل فارسی درباره آخرین اخبار و پیشرفت‌های تکنولوژی بنویس.

مقاله باید:
- عنوان جذاب و مشخص داشته باشد
- ۴ تا ۶ پاراگراف باشد
- هر پاراگراف ۳ تا ۵ جمله داشته باشد
- سبک نوشتاری تحلیلی و حرفه‌ای باشد
- موضوع جدید و مرتبط با سال ۲۰۲۵ باشد
- درباره یکی از این موضوعات باشد: هوش مصنوعی، رباتیک، فضا، کوانتوم، خودروهای الکتریکی، متاورس، بلاکچین، امنیت سایبری

پاسخ را دقیقاً در این فرمت JSON بده و هیچ چیز دیگری ننویس:
{"title":"عنوان مقاله","body":"پاراگراف اول\n\nپاراگراف دوم\n\nپاراگراف سوم\n\nپاراگراف چهارم"}`;

  console.log('Calling Gemini API...');

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1500 }
      })
    }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    throw new Error(`Gemini error: ${err}`);
  }

  const geminiData = await geminiRes.json();
  const rawText = geminiData.candidates[0].content.parts[0].text.trim();

  // پاک کردن markdown اگه بود
  const jsonText = rawText.replace(/```json\n?|\n?```/g, '').trim();
  const post = JSON.parse(jsonText);

  console.log(`Generated: ${post.title}`);

  // ذخیره در Supabase
  const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      title: post.title,
      body: post.body,
      category: 'تکنولوژی',
      status: 'published',
      is_best: false,
      view_count: 0
    })
  });

  if (!supaRes.ok) {
    const err = await supaRes.text();
    throw new Error(`Supabase error: ${err}`);
  }

  console.log(`✓ Post published: ${post.title}`);
}

generatePost().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
