import fetch from 'node-fetch';

const KEY = process.env.OPENROUTER_API_KEY;
const DB_URL = process.env.SUPABASE_URL;
const DB_KEY = process.env.SUPABASE_KEY;

const today = new Date();
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

const prompt = `بازه زمانی فعلی: از تاریخ ${lastWeek.toISOString().split('T')[0]} تا ${today.toISOString().split('T')[0]} (برابر با هفته جاری در سال 2026)

وظیفه شما:
۱. از بین این چهار موضوع، یکی را به صورت کاملاً تصادفی انتخاب کن: "تراشه‌های پردازنده"، "هوش مصنوعی"، "خودروهای برقی"، "سیستم‌عامل‌ها".
۲. با استفاده از ابزار جستجوی خود، اخبار و رویدادهای واقعی بین‌المللی مرتبط با آن موضوع را که دقیقاً در همین بازه زمانی (هفته جاری) رخ داده‌اند، جستجو کن.
۳. بر اساس یک خبر مشخص، مستند و بسیار جدید یافته‌شده، یک مقاله خبری-تحلیلی به زبان فارسی بنویس.

شرایط سخت‌گیرانه مقاله:
- روی یک خبر یا رویداد مشخص تمرکز کن و از کلی‌گویی و اطلاعات قدیمی یا فرضی جداً خودداری کن.
- لحن جذاب، روان، حرفه‌ای و تحلیل‌گرایانه داشته باشد.
- دقیقاً ۶ پاراگراف داشته باشد و هر پاراگراف بدون استثنا شامل ۳ تا ۴ جمله باشد.
- حتماً حاوی جزئیات واقعی، نام دقیق شرکت‌ها، مدل محصول، آمار و ارقام و داده‌های کمی مربوط به خبر این هفته باشد.

خروجی را فقط و فقط در قالب ساختار JSON زیر تحویل بده و هیچ متن اضافه، مقدمه، موخره یا علامت \`\`\`json در ابتدا و انتها قرار نده:
{"title":"عنوان خبری جذاب و تحلیل‌گرایانه","body":"پاراگراف اول\\n\\nپاراگراف دوم\\n\\nپاراگراف سوم\\n\\nپاراگراف چهارم\\n\\nپاراگراف پنجم\\n\\nپاراگراف ششم"}`;

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
  
  if (!r1.ok) { 
    const e = await r1.text(); 
    throw new Error('OpenRouter: ' + e); 
  }
  
  const d1 = await r1.json();
  let text = d1.choices[0].message.content.trim();
  
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
      category: 'تکنولوژی', 
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

run().catch(e => { 
  console.error(e.message); 
  process.exit(1); 
});
