'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, MapPin, Layers, WifiOff, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function GuidePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" className="nav-btn" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Back to Map</span>
          </Link>
          <div className="brand-title">Myanmar PCode User Guide / အသုံးပြုနည်းလမ်းညွှန်</div>
        </div>

        <div className="nav-actions">
          <Link href="/docs" className="nav-link">
            REST API Docs
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Guide Content */}
      <main className="doc-page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Myanmar PCode Search အသုံးပြုနည်း လမ်းညွှန်</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
            မြန်မာနိုင်ငံရှိ ပြည်နယ်/တိုင်းဒေသကြီး၊ ခရိုင်၊ မြို့နယ်၊ မြို့၊ ရပ်ကွက်၊ ကျေးရွာအုပ်စုနှင့် ကျေးရွာများ၏ PCode (Place Code) များနှင့် စာတိုက်သင်္ကေတ (Postal Code) များကို ရှာဖွေအသုံးပြုပုံ အဆင့်ဆင့်လမ်းညွှန်။
          </p>
        </div>

        {/* Section 1: Text Search */}
        <section className="doc-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon">
              <Search size={20} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>၁။ အမည် သို့မဟုတ် PCode ဖြင့် ရှာဖွေခြင်း (Text Search)</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            ရှာဖွေမှုအကွက် (Search Bar) တွင် မြန်မာစာ (Unicode) ဖြင့်ဖြစ်စေ၊ အင်္ဂလိပ်စာဖြင့်ဖြစ်စေ၊ PCode နံပါတ်ဖြင့်ဖြစ်စေ ရိုက်ထည့်၍ ရှာဖွေနိုင်ပါသည်။
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>မြို့အမည်ဖြင့် ရှာခြင်း:</strong> ဥပမာ - <code>Yangon</code> သို့မဟုတ် <code>ရန်ကုန်</code>၊ <code>Mandalay</code> သို့မဟုတ် <code>မန္တလေး</code></li>
            <li><strong>ကျေးရွာ/ရပ်ကွက်အမည်ဖြင့် ရှာခြင်း:</strong> ဥပမာ - <code>Da None Chaung</code> သို့မဟုတ် <code>ဓနုံးချောင်း</code></li>
            <li><strong>PCode ဖြင့် ရှာခြင်း:</strong> ဥပမာ - <code>MMR013000777</code> (တိကျသော အုပ်ချုပ်မှုအဆင့်ဆင့်နှင့် Postal code တိုက်ရိုက်ထွက်လာမည်)</li>
            <li><strong>Filter စစ်ထုတ်ခြင်း:</strong> အပေါ်ရှိ <code>Towns</code>, <code>Wards</code>, <code>Tracts</code>, <code>Villages</code> ခလုတ်များကို ရွေးချယ်၍ အမျိုးအစားအလိုက် သီးသန့်စစ်ထုတ်နိုင်ပါသည်။</li>
          </ul>
        </section>

        {/* Section 2: Coordinates & Google Maps */}
        <section className="doc-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon">
              <MapPin size={20} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>၂။ ကိုဩဒိနိတ် (Coordinates) နှင့် မြေပုံပေါ်နှိပ်၍ ရှာဖွေခြင်း</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            မြေပြင်ရှိ တည်နေရာ (GPS Coordinates) ကို အခြေခံ၍ အနီးဆုံး PCode များကို အကွာအဝေး (km) နှင့်တကွ Reverse-geocode လုပ်ပေးနိုင်ပါသည်။
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>မြေပုံပေါ် တိုက်ရိုက်နှိပ်ခြင်း:</strong> ညာဘက်ရှိ Interactive Map ပေါ်တွင် မိမိလိုချင်သော နေရာကို နှိပ်လိုက်ပါက ထိုနေရာအနီးဆုံး PCode များကို ချက်ချင်းရှာဖွေပေးပါသည်။</li>
            <li><strong>Lat/Lng တိုက်ရိုက်ရိုက်ထည့်ခြင်း:</strong> ဥပမာ - <code>16.8661, 96.1951</code></li>
            <li><strong>Google Maps Link ကူးထည့်ခြင်း:</strong> Google Maps မှ Share Link သို့မဟုတ် URL (ဥပမာ - <code>https://maps.google.com/?q=16.8661,96.1951</code>) ကို ကူးထည့်ရှာဖွေနိုင်ပါသည်။</li>
          </ul>
        </section>

        {/* Section 3: Batch CSV */}
        <section className="doc-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon">
              <Layers size={20} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>၃။ Coordinates အများအပြားကို Batch CSV ဖြင့် တစ်ပြိုင်နက် စစ်ဆေးခြင်း</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            သုတေသနလုပ်ငန်းများ သို့မဟုတ် ကျန်းမာရေးစစ်တမ်းများအတွက် တည်နေရာ Coordinates ပေါင်း ၂,၀၀၀ အထိပါဝင်သော CSV ဖိုင်ကို တစ်ပြိုင်နက် PCode တွဲစပ်နိုင်ပါသည်။
          </p>
          <div className="code-block">
            <pre>{`id,latitude,longitude
1,16.8661,96.1951
2,21.9588,96.0891
3,16.7967,96.1500`}</pre>
          </div>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Navbar ပေါ်ရှိ <strong>Batch CSV</strong> ခလုတ်ကို နှိပ်ပါ။</li>
            <li>မိမိ၏ CSV ဖိုင်ကို Drag & Drop သို့မဟုတ် Browse ဖြင့် ရွေးချယ်တင်သွင်းပါ။</li>
            <li>စနစ်က အနီးဆုံး PCode၊ မြို့နယ်နှင့် စာတိုက်သင်္ကေတများကို auto-match လုပ်ပေးပြီးပါက <strong>Export Results (.csv)</strong> ဖြင့် ဒေါင်းလုပ် ရယူနိုင်ပါသည်။</li>
          </ol>
        </section>

        {/* Section 4: Offline Mode */}
        <section className="doc-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon">
              <WifiOff size={20} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>၄။ အင်တာနက်မရှိဘဲ သုံးစွဲခြင်း (100% Offline Mode)</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            အင်တာနက်လိုင်းမရသော ကွင်းဆင်းဒေသများတွင် သုံးစွဲနိုင်ရန် Browser ၏ <strong>IndexedDB</strong> ထဲတွင် မြန်မာနိုင်ငံတစ်ဝန်းရှိ နေရာပေါင်း ၉၀,၆၇၆ ခုကို သိမ်းဆည်းထားနိုင်ပါသည်။
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Navbar ပေါ်ရှိ <strong>Offline Mode / Sync Offline</strong> ခလုတ်ကို နှိပ်ပါ။</li>
            <li><strong>"Download Database for Offline Use"</strong> ကို နှိပ်ပြီး တစ်ကြိမ်သာ သိမ်းဆည်းပါ (ဖိုင်အရွယ်အစား ၂.၄ MB မျှသာ ရှိပါသည်)။</li>
            <li>သိမ်းဆည်းပြီးပါက အင်တာနက် လုံးဝ ပိတ်ထားသော်လည်း ရှာဖွေမှုများ၊ မြေပုံ Marker များနှင့် Batch CSV တွက်ချက်မှုများကို အပြည့်အဝ အသုံးပြုနိုင်မည် ဖြစ်ပါသည်။</li>
          </ul>
        </section>

        {/* Section 5: REST API Integration */}
        <section className="doc-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon">
              <FileText size={20} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>၅။ Developer များအတွက် REST API အသုံးပြုခြင်း</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            အခြားသော Mobile App သို့မဟုတ် Web App များမှ တိုက်ရိုက်ခေါ်ယူ အသုံးပြုနိုင်ရန် REST API v1 ကို ပံ့ပိုးပေးထားပါသည်။ အသေးစိတ် Code နမူနာများနှင့် စမ်းသပ်ရန်{' '}
            <Link href="/docs" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'underline' }}>
              REST API Documentation
            </Link>{' '}
            စာမျက်နှာသို့ သွားရောက် ကြည့်ရှုနိုင်ပါသည်။
          </p>
        </section>
      </main>
    </div>
  );
}
