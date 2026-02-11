import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
    console.log("🔍 Verifying Supabase Configuration...");

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error("❌ Missing Details: Check SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.");
        if (!url) console.error("   - SUPABASE_URL is missing/empty");
        if (!key) console.error("   - SUPABASE_ANON_KEY is missing/empty");
        return;
    }

    // Masked log for safety
    console.log(`✅ Credentials Found:`);
    console.log(`   - URL: ${url}`);
    console.log(`   - Key: ${key.substring(0, 8)}...`);

    const supabase = createClient(url, key);

    console.log("\n📡 Testing Connection to Storage...");
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("❌ Connection Failed:", error.message);
        console.error("   - Verify your Anon Key is correct.");
        console.error("   - Verify your Project URL is correct.");
    } else {
        console.log("✅ Connection Successful!");
        console.log("📁 Buckets found:", buckets.length);
        buckets.forEach(b => console.log(`   - ${b.name} (${b.public ? 'Public' : 'Private'})`));

        const targetBucket = 'resource-images';
        const bucket = buckets.find(b => b.name === targetBucket);

        if (!bucket) {
            console.warn(`\n⚠️ CRITICAL: Bucket '${targetBucket}' NOT FOUND.`);
            console.warn(`   Action Required: Go to Supabase Storage -> New Bucket -> Name it '${targetBucket}' -> Make it Public.`);
        } else {
            console.log(`\n✅ Target bucket '${targetBucket}' exists.`);
        }
    }

    console.log("\n💾 Database Check:");
    if (!process.env.DATABASE_URL) {
        console.log("ℹ️  DATABASE_URL is not set.");
        console.log("   -> The app is using LOCAL SQLite for data (Students, Resource Metadata).");
        console.log("   -> Only IMAGES are being sent to Supabase Storage.");
        console.log("   -> If you want your DATA on Supabase too, you must set DATABASE_URL.");
    } else {
        console.log("✅ DATABASE_URL is set. Application is configured to use external Postgres.");
    }
}

main().catch(console.error);
