# Changelog / ပြောင်းလဲမှုမှတ်တမ်း

All notable changes to Myanmar PCode Search. This document contains both simple, everyday explanations for regular users and detailed technical notes for developers.

မြန်မာ PCode ရှာဖွေရေးစနစ်၏ ဗားရှင်းအလိုက် ပြောင်းလဲမှုမှတ်တမ်းဖြစ်ပါသည်။ သာမန်အသုံးပြုသူများ နားလည်လွယ်စေရန် ရှင်းလင်းချက်များနှင့် ဆော့ဖ်ဝဲလ်ရေးသားသူများအတွက် နည်းပညာဆိုင်ရာ အသေးစိတ်အချက်အလက်များကို ဘာသာစကားနှစ်မျိုးဖြင့် ဖော်ပြထားပါသည်။

---

## [2.0.0] - 2026-09-15

### 🌟 What's New for Everyday Users / သာမန်အသုံးပြုသူများအတွက် အကျဉ်းချုပ်

> **English:**
> - **Brand New Faster Website:** Rebuilt from scratch to be much faster, smoother, and mobile-friendly.
> - **Search by Postal Code:** You can now enter postal codes (e.g., `1118001`) or township prefixes (`1118`) to immediately find matching wards and villages. Myanmar numbers are fully supported!
> - **Works Completely Offline:** Download the database once (~3.2 MB) and keep searching even when traveling in remote areas with no phone service or internet.
> - **Click Anywhere on the Map:** Click anywhere on Myanmar's map or paste a Google Maps link to instantly discover the nearest village or town and how many kilometers away it is.
> - **Search Landmarks:** Find places near famous spots like Shwedagon Pagoda or shopping malls.
> - **Batch Upload:** Upload an Excel/CSV file with up to 2,000 GPS locations at once to match them with PCodes automatically.
> - **Updated 2026 Data:** Includes MIMU Release 9.7 (January 2026) with over 870 corrected village locations and hundreds of newly surveyed places.
> - **Estimated Locations for Wards:** Wards and village tracts without official GPS pins now have estimated centers shown on the map so you never get lost.
> - **Bilingual Support & Dark Mode:** Easy switching between Myanmar and English, plus Light and Dark themes.

> **မြန်မာဘာသာ:**
> - **ပိုမိုမြန်ဆန်ပြီး သစ်လွင်သော ဒီဇိုင်း:** ဖုန်းနှင့် ကွန်ပျူတာတို့တွင် ပိုမိုပေါ့ပါးသွက်လက်စွာ အသုံးပြုနိုင်ရန် အခြေခံမှစ၍ အသစ်ပြန်လည်ရေးသားထားပါသည်။
> - **စာတိုက်သင်္ကေတ (Postal Code) ဖြင့် ရှာဖွေနိုင်ခြင်း:** ဂဏန်း ၇ လုံးပါ စာတိုက်ကုဒ် (ဥပမာ - `1118001`) သို့မဟုတ် မြို့နယ်ကုဒ် (`1118`) ကို ရိုက်ထည့်၍ သက်ဆိုင်ရာ ရပ်ကွက်နှင့် ကျေးရွာများကို ချက်ချင်းရှာဖွေနိုင်ပါပြီ။ မြန်မာဂဏန်းများဖြင့်လည်း ရိုက်ထည့်ရှာဖွေနိုင်ပါသည်။
> - **အင်တာနက်လုံးဝမလိုဘဲ အသုံးပြုနိုင်ခြင်း (Offline Mode):** ဒေတာဖိုင် (~3.2 MB) ကို တစ်ကြိမ်ဒေါင်းလုပ်ဆွဲထားရုံဖြင့် ဖုန်းလိုင်းမမိသော နယ်မြေများသို့ သွားရောက်သည့်အခါ အင်တာနက်မရှိဘဲ အသုံးပြုနိုင်ပါသည်။
> - **မြေပုံပေါ်နှိပ်၍ တည်နေရာရှာဖွေခြင်း:** မြေပုံပေါ်ရှိ မည်သည့်နေရာကိုမဆို နှိပ်လိုက်ရုံဖြင့် အနီးဆုံးကျေးရွာ၊ ရပ်ကွက်နှင့် ကီလိုမီတာ အကွာအဝေးကို တွက်ချက်ပြသပေးပါသည်။ Google Maps Link ထည့်၍လည်း ရှာဖွေနိုင်ပါသည်။
> - **ထင်ရှားသောနေရာများဖြင့် ရှာဖွေခြင်း:** ရွှေတိဂုံဘုရား ကဲ့သို့သော ထင်ရှားသည့်နေရာအမည်များဖြင့် အလွယ်တကူ ရှာဖွေနိုင်ပါသည်။
> - **CSV ဖိုင် အများအပြား တစ်ပြိုင်နက်တွဲစပ်ခြင်း (Batch CSV):** ကွင်းဆင်းစစ်တမ်းများမှ GPS တည်နေရာပေါင်း ၂,၀၀၀ အထိပါဝင်သော CSV ဖိုင်ကို တစ်ပြိုင်နက် PCode တွဲစပ်ပြီး ထုတ်ယူနိုင်ပါသည်။
> - **၂၀၂၆ နောက်ဆုံးပေါ် အချက်အလက်များ:** ၂၀၂၆ ခုနှစ် ဇန်နဝါရီလထုတ် MIMU Release 9.7 စာရင်းသစ်ကို အသုံးပြုထားပြီး တည်နေရာမှားယွင်းနေသော ကျေးရွာ ၈၇၀ ကျော်ကို ပြင်ဆင်ထားသည့်အပြင် အသစ်စစ်တမ်းကောက်ယူထားသော ရွာပေါင်းရာချီ ပါဝင်လာပါသည်။
> - **ရပ်ကွက်နှင့် ကျေးရွာအုပ်စုများအတွက် ခန့်မှန်းတည်နေရာ:** တရားဝင် GPS မရှိသေးသော ရပ်ကွက်နှင့် ကျေးရွာအုပ်စုများအတွက် ခန့်မှန်းဗဟိုတည်နေရာများကို မြေပုံပေါ်တွင် အစက်ချမျဉ်းများဖြင့် ရှင်းလင်းစွာ ဖော်ပြပေးထားပါသည်။
> - **မြန်မာ/အင်္ဂလိပ် နှစ်ဘာသာနှင့် ညဘက်သုံး Dark Mode:** မိမိနှစ်သက်ရာ ဘာသာစကားနှင့် အလင်း/အမှောင် အရောင်စနစ်များကို စိတ်ကြိုက်ပြောင်းလဲအသုံးပြုနိုင်ပါသည်။

---

### 💻 Technical Details for Developers / နည်းပညာဆိုင်ရာ အသေးစိတ်

#### Added
- **Modern Stack:** Full rewrite using **Next.js (App Router)** and **TypeScript**, replacing the previous static HTML/JS build.
- **REST API:** Production-ready endpoints under `/api/v1` (with unversioned `/api/*` backwards-compatible aliases):
  - `GET /api/v1/search?q={query}&type={type}` (supports text and postal search)
  - `GET /api/v1/nearby?lat={lat}&lng={lng}&radius={km}` (spatial nearest-neighbor search)
  - `GET /api/v1/pcode/{code}` (direct PCode entity lookup)
  - `GET /api/v1/stats` (dataset count breakdown)
  - `POST /api/v1/batch` (parallel reverse geocoding for up to 2,000 points)
  - Interactive API documentation and testing playground at `/docs`.
- **Approximate Centroids for Polygon Levels:** MIMU does not publish point coordinates for wards and village tracts. The build pipeline now generates centroids using OCHA COD-AB boundaries, falling back to village midpoints or parent town locations. Each record has a `coord_source` attribute (`mimu`, `boundary`, `villages`, `town`).
- **Client-Side IndexedDB Storage:** Compressed in-browser database (~3.2 MB) enabling 100% offline search and reverse geocoding.

#### Changed
- **Data Refresh (MIMU Release 9.7, Jan 2026):**
  - Added 2 new villages.
  - Added coordinates for 752 previously unlocated villages.
  - Corrected coordinates for ~870 existing villages.
  - Cleaned up malformed PCodes in Twantay township.
- **Zero Database Architecture:** Replaced SQLite runtime with an in-memory spatial grid and hash maps loaded from `public/data/pcode-compact.json`. Serverless-ready on Netlify and Vercel with zero startup latency.
- **Stats Endpoint:** Separated `placesWithApproximateCoordinates` from surveyed `placesWithCoordinates`.

#### Removed
- Retired legacy static files in `legacy/` (tagged in git as `legacy-static-v1.4`).
- Removed SQLite database file (`data/pcode.db`) and custom Python build scripts in favor of TypeScript build tool (`scripts/build-data.ts`).

---

## [1.4.0] - 2025-06-02

### 🌟 Layman Summary / အကျဉ်းချုပ်
- **Massive Speed Boost:** Searching and finding nearby places is 50 to 100 times faster.
- **Landmark Search:** Search by popular landmarks via OpenStreetMap.
- **Google Maps Link Support:** Paste any Google Maps link directly into search.
- **Faster File Uploads:** Faster processing when checking large CSV files.

- ရှာဖွေမှုအမြန်နှုန်း ၅၀ မှ ၁၀၀ ဆအထိ ပိုမိုမြန်ဆန်လာခြင်း။
- OpenStreetMap မှတစ်ဆင့် ထင်ရှားသောနေရာများ (Landmarks) ဖြင့် ရှာဖွေနိုင်ခြင်း။
- Google Maps Link များကို ကူးထည့်ရှာဖွေနိုင်ခြင်း။
- CSV ဖိုင်များ စစ်ဆေးရာတွင် တစ်ပြိုင်နက် မြန်ဆန်စွာ ဆောင်ရွက်နိုင်ခြင်း။

---

## [1.2.0] - 2025-06-01

### 🌟 Layman Summary / အကျဉ်းချုပ်
- **GPS Coordinates Search:** Find the nearest town or village by typing latitude and longitude.
- **CSV File Upload:** Upload a list of coordinates to automatically match with regions, townships, and villages.

- Latitude နှင့် Longitude (GPS ဂဏန်းများ) ရိုက်ထည့်၍ အနီးဆုံးနေရာများကို ရှာဖွေနိုင်ခြင်း။
- တည်နေရာစာရင်းပါသော CSV ဖိုင်ကို ထည့်သွင်း၍ သက်ဆိုင်ရာ ပြည်နယ်/တိုင်း၊ ခရိုင်၊ မြို့နယ်၊ မြို့နှင့် ကျေးရွာများကို auto-match လုပ်ပေးနိုင်ခြင်း။

---

## [1.1.0] - 2025-02-14

### 🌟 Layman Summary / အကျဉ်းချုပ်
- Updated data to MIMU PCode Release 9.6.
- Added village-level search across all states and regions.

- MIMU PCode Release 9.6 သို့ ဒေတာအသစ် အဆင့်မြှင့်တင်ခြင်း။
- မြန်မာတစ်နိုင်ငံလုံးရှိ ကျေးရွာအဆင့်ထိ အသေးစိတ် ရှာဖွေနိုင်လာခြင်း။

---

## [1.0.0]

### 🌟 Layman Summary / အကျဉ်းချုပ်
- Initial public release of Myanmar PCode Search.
- Support for state, district, township, and town place code lookups.

- မြန်မာ PCode ရှာဖွေရေးစနစ်ကို ပထမဆုံး စတင်မိတ်ဆက်ဖြန့်ချိခြင်း။
- ပြည်နယ်/တိုင်းဒေသကြီး၊ ခရိုင်၊ မြို့နယ်နှင့် မြို့အဆင့် PCode များကို စတင်ရှာဖွေနိုင်ခြင်း။
