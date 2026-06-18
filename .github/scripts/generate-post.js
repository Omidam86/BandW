const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function generatePost() {
  const prompt = `یک مقاله کامل و حرفه‌ای فارسی درباره آخرین اخبار و پیشرفت‌های تکنولوژی بنویس.

مقاله باید:
- عنوان جذاب و مشخص داشته باشد
- ۴ تا ۶ پاراگراف باشد
- هر پاراگراف ۳ تا ۵ جمله کامل داشته باشد
- سبک نوشتاری تحلیلی، روان و حرفه‌ای باشد
- موضوع جدید و مرتبط با سال ۲۰۲۵ باشد
- درباره یکی از این موضوعات باشد: هوش مصنوعی، رباتیک، فضا، کوانتوم، خودروهای الکتریکی، امنیت سایبری، چیپ‌های پیشرفته

فقط یک JSON بده و هیچ چیز دیگری ننویس:
{"title":"عنوان مقاله","body":"پاراگراف اول\n\nپاراگراف دوم\n\nپاراگراف سوم\n\nپاراگراف چهارم"}`;

  console.log('Calling OpenRouter API...');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://omidam86.github.io/BandW',
      'X-Title': 'BandW Blog'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1500
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error: ${err}`);
  }

  const data = await res.json();
  const rawText = data.choices[0].message.content.trim();
  const jsonText = rawText.replace(/```json\n?|\n?```/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const post = JSON.parse(jsonText);

  console.log(`Generated: ${post.title}`);

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
});  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek error: ${err}`);
  }

  const data = await res.json();
  const rawText = data.choices[0].message.content.trim();
  const jsonText = rawText.replace(/```json\n?|\n?```/g, '').trim();
  const post = JSON.parse(jsonText);

  console.log(`Generated: ${post.title}`);

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
