# Script guide & compliance

> Landing copy နှင့် အက်ပ် ကိုက်ညီမှု၊ မပြောရသော အရာများ၊ script angles။

## Landing ရဲ့ ၈ လုပ်ဆောင်ချက်

| # | English | Myanmar | မှတ်ချက် |
|---|---------|---------|----------|
| 1 | Multi-Tier User Control | အဆင့်အလိုက် အသုံးပြုသူ စီမံခန့်ခွဲမှု | ✅ |
| 2 | Dynamic Invoice Engine | အလိုအလျောက် ပြေစာဖန်တီးစနစ် | ✅ |
| 3 | Instant Local Payments | ပြည်တွင်းငွေပေးချေမှု QR | ✅ (gateway မဟုတ်) |
| 4 | Custom Branding | ကိုယ်ပိုင်အမှတ်တံဆိပ် | ✅ |
| 5 | Print & Export Ready | A4 + PDF | ✅ |
| 6 | Client & Product Catalog | ဖောက်သည် + ကုန်ပစ္စည်း | ⚠️ Client ✅; full product catalog မပြည့် |
| 7 | Revenue & Unpaid Analytics | ဝင်ငွေ analytics | ✅ |
| 8 | Cloud Sync & Data Security | Cloud + backup | ⚠️ DB/S3 ရှိ; in-app auto backup scheduler မပါ |

## Landing ကတိကဝတ် (သတိ)

- **SAFE & SECURE DATA** — hosting/process နှင့် ဆက်စပ် ပြောပါ  
- **24/7 TECHNICAL SUPPORT** — အက်ပ်ထဲ ticket မရှိ  
- **AUTOMATIC CLOUD BACKUP** — အက်ပ်ထဲ scheduler မရှိ (`pg_dump` စသည် infra)

## မပါဝင်သော အရာများ

Public signup, in-app payment, invoice email, public share links, FX conversion, recurring invoices, accounting integrations. Invoice print/PDF labels — English template (UI ဘာသာပြောင်းလည်း content မပြောင်း)။

## Script angles

1. လုပ်ငန်းရှင် — Excel/နံပါတ်ရေ/QR မပါ → San Pya တစ်ခါတည်း  
2. မြန်မာစီးပွားရေး — KPay/Wave၊ ကျပ်၊ Yangon ရက်  
3. အဖွဲ့ — admin settings၊ staff ပြေစ만  
4. Demo — ၂ မိနစ် အတွင်း states ကြည့်  
5. ယုံကြည်မှု — snapshot, session revoke, company suspend  

## One-liners

**MY:** San Pya Invoice သည် ကုမ္ပဏီအလိုက် workspace၊ QR ပြေစာ၊ branding၊ PDF/print၊ revenue insights နှင့် Admin/Staff ခွင့်ပြုချက်ကို English/မြန်မာဖြင့် ပေးသော B2B ဖြေရှင်းချက်ဖြစ်ပြီး ၂၅,၀၀၀ ကျပ်မှ activation လုပ်ငန်းစဉ်မှတစ်ဆင့် စတင်နိုင်သည်။

**EN:** San Pya Invoice is a company-isolated B2B workspace for branded invoices, local payment QR codes, PDF/print export, revenue insights, and role-based team access—on MMK plans from 25,000 with English and Myanmar UI.
