const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL یا SUPABASE_ANON_KEY در .env تنظیم نشده");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

console.log("Supabase Config Loaded! ✅");
if (!supabaseServiceKey) {
  console.warn(
    "⚠️ SUPABASE_SERVICE_ROLE_KEY تنظیم نشده. برخی عملیات ادمین کار نخواهد کرد.",
  );
}

module.exports = {
  supabase,
  supabaseAdmin,
};
