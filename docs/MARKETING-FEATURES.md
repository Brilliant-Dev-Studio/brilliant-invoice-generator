# San Pya Invoice (Brilliant Invoice Generator) — Feature List

> Marketing / script အတွက် စာရင်း။ အက်ပ်ထဲတွင် **အမှန်တကယ် ရှိသော လုပ်ဆောင်ချက်များ** နဲ့ လန်ဒင်ပေ့ချ်တွင် **ကတိပြုထားသော စာသား** ကို ခွဲထားပါသည်။

---

## Product snapshot

| | |
|---|---|
| **အမည် (ပြည်သူ့မျက်နှာ)** | San Pya Invoice |
| **အမျိုးအစား** | B2B ပြေစာဖန်တီးခြင်း + လုပ်ငန်းစီမံခန့်ခွဲမှု workspace |
| **ဈေးနှုန်း (MMK)** | ၂၅,၀၀၀ / ၇၅,၀၀၀ / ၁၅၀,၀၀၀ / ၃၀၀,၀၀၀ (၁ လ / ၃ လ / ၆ လ / ၁ နှစ်) |
| **အပိုဆု** | ၃ လ → ၃ ရက် \| ၆ လ → ၇ ရက် \| ၁ နှစ် → ၁ လ |
| **ဘာသာစကား** | English + မြန်မာ (လန်ဒင်ပေ့ချ်၊ login၊ dashboard၊ superadmin) |
| **အကောင့်ဖွင့်** | Public signup မရှိ — San Pya ကိုယ်စားလှယ်နှင့် activation |
| **Demo** | `demo@sanpya.com` — signup မလို၊ နမူနာဒေတာ |

**Tagline (EN):** Big dreams. Busy days. Beautiful invoices.  
**Tagline (MY):** ရည်မှန်းချက်ကြီးကြီး၊ အလုပ်များတဲ့နေ့များနဲ့ သပ်ရပ်လှပတဲ့ ပြေစာများ။

---

## Core value (script အတွက် တိုတောင်းစာသား)

1. ပြေစာရေးခြင်း၊ နံပါတ်ပေးခြင်း၊ တွက်ချက်မှု — တစ်နေရာတည်း  
2. KPay / Wave / ဘဏ် QR — ပြေစာပေါ်တင်ပြီး ဖောက်သည်ကို ချက်ချင်းပေးချေနိုင်  
3. ကုမ္ပဏီလိုဂို + ဒစ်ဂျစ်တယ်လက်မှတ် — ကိုယ်ပိုင်အမှတ်တံဆိပ်  
4. A4 print + PDF export — ပုံစံတူ၊ ပရော်ဖက်ရှင်နယ်  
5. ဝင်ငွေ / မရရှိသေးငွေ — dashboard မှာ မြင်သာအောင်  
6. Admin + Staff — အဖွဲ့အတွက် ခွင့်ပြုချက်ခွဲထားခြင်း  

---

## လုပ်ဆောင်ချက်များ (အက်ပ်တွင် ရှိပြီး)

### ပြေစာ (Invoice)

- **Draft → Issue → Paid** လုပ်ငန်းစဉ် (issued ပြေစာကို်မပြင်နိုင် — snapshot)
- **အလိုအလျောက် ပြေစာနံပါတ်** — ကုမ္ပဏီ + နှစ်အလိုက် sequence (PostgreSQL transaction)
- **လိုင်း ၁၀၀ အထိ** — ပစ္စည်း/ဝန်ဆောင်မှု၊ အရေအတွက် (၃ ဒသမအထိ)، တစ်ခုချင်းစျေးနှုန်း
- **လျှော့စျေး** — ရာခိုင်နှုန်း (%) သို့မဟုတ် ပုံသေပမာဏ
- **အခွန်** — လျှော့စျေးနောက်မှ တွက်ချက်ခြင်း
- **ငွေကြေး** — MMK, USD, THB (ပြောင်းလဲနှုန်း မတွက်ပါ — ရွေးထားသော ငွေကြေးဖြင့် သန်ပြသမှု)
- **ငွေပမာဏ တိကျမှု** — minor units၊ နှစ်ဆ ဒသမနေရာများ
- **စာရင်းဇယား** — Draft / Unpaid / Paid / Overdue (due နောက်နေ့မှ overdue — **Asia/Yangon**)
- **ပြေစာခေါင်းစဉ်၊ ထုတ်ပေးရက်၊ နောက်ဆုံးပေးချေရက်၊ terms**
- **ငွေပေးချေနည်း** — KPay / WavePay / Bank ရွေးချယ်ပြီး QR ပြသခြင်း
- **Client ရွေးချယ်** — ပြေစာတည်းဖြတ်သူထဲမှ client အသစ်ထည့်နိုင်
- **Revision check** — draft တည်းဖြတ်ရာတွင် conflict ကာကွယ်

### ပြေစာပုံစံ (Design)

- **Template ၁၀ မျိုး** — Studio, Minimal, Classic, Executive, Editorial, Ledger, Modern, Boutique, Corporate, Signature
- **Theme** — Light / Dark
- **Accent color** — ၆ မျိုး + custom hex (ဖတ်ရလွယ်မှု contrast စစ်ခြင်း)
- Settings နှင့် ပြေစာတစ်ခုချင်းတွင် design သိမ်းနိုင်

### Print & PDF

- **Browser print** — A4-friendly CSS
- **PDF download** — Chromium headless (print route နှင့် component တူ)
- **Branding ပုံ** — authenticated fetch (logo, signature, QR)
- **Demo watermark** — demo workspace print/PDF တွင် watermark

### ဖောက်သည် (Clients)

- Client စာရင်း စီမံခန့်ခွဲခြင်း
- အမည်၊ email၊ လိပ်စာ၊ ဖုန်း

### ကုမ္ပဏီ ပရိုဖိုင် (Company settings)

- ကုမ္ပဏီအမည်၊ လိပ်စာ၊ ဖုန်း၊ email၊ Tax ID
- **Logo** — upload + crop
- **Signature** — upload သို့မဟုတ် canvas ပေါ်တွင် ဆွဲခြင်း
- **KPay / WavePay / Bank QR** — upload (S3 သိုလှောင်)
- **Default invoice appearance** — template / theme / accent
- **Financial overview override** — dashboard ပုံသေတွက်ချက်မှုကို လက်ဖြင့် ပြင်နိုင် (ငွေကြေးခွဲ)

### Dashboard & Analytics

- **၆ လ** လစဉ် paid revenue chart (ငွေကြေးရွေးချယ်)
- စုစုပေါင်း collected၊ outstanding၊ overdue၊ drafts
- Priority / action hints (unpaid, overdue, drafts)
- **Financial overview** settings page — revenue / outstanding / count manual values

### အဖွဲ့ & ခွင့်ပြုချက် (Roles)

| Role | လုပ်ပိုင်ခွင့် အကျဉ်းချုပ် |
|------|---------------------------|
| **STAFF** | Clients၊ ပြေစာဖန်တီး/issue၊ print/PDF၊ paid မှတ်ခြင်း မဟုတ် |
| **COMPANY_ADMIN** | Company settings၊ team (staff အများဆုံး ၃)， account စီမံခန့်ခွဲမှု |
| **SUPERADMIN** | Platform `/superadmin` — ကုမ္ပဏီများ၊ subscription၊ audit |

- Login — **email သို့မဟုတ် phone** (optional)
- **Login lockout** — identifier အလိုက် ၁၅ မိနစ်
- **Session** — ၈ နာရီ JWT၊ HTTP-only cookie၊ suspend/password reset ဖြင့် revoke
- **Session monitor** — tab focus / ၁၅ စက္ကန့် ပြန်စစ်

### ဘာသာစကား & UI

- **English / မြန်မာ** — cookie ၁ နှစ် (`brilliant_language`)
- **Light / Dark theme** — လန်ဒင်ပေ့ချ် + workspace
- **Responsive** — mobile မှ editor စမ်းသပ်ရန် README အကြံပြု
- **Mascot companion** — dashboard တွင် စာတိုများ၊ ရာသီဥတု (optional API)
- **Validation toasts** — form အမှြသခြင်း

### Demo sandbox

- Login မှ **Try Demo** — နမူနာ clients၊ products (MMK quick-add)、 invoices ၄ မျိုး
- **Daily reset** (production cron) + seed script
- Demo — image upload / admin မလုပ်နိုင်

### Platform owner (Superadmin) — B2B operator အတွက်

- **Overview** — subscription counts, plan value, charts (၆/၁၂ လ)
- **Companies** — search, suspend/reactivate company, profile, users, plans
- **Subscriptions** — plan assign, renewal terms, MMK catalog snapshot
- **Accounts** — platform-wide user create / suspend / password reset
- **Activity** — audit log, cursor pagination, Yangon time
- Company suspend → tenant sessions revoke

### အခြေခံ နည်းပညာ (trust script အတွက်)

- PostgreSQL — company-isolated data
- Private **S3** uploads (PNG/JPEG/WebP, 5MB, re-encoded)
- Server Actions + server-side authorization
- Invoice snapshots — branding ပြောင်းလဲပြီးလည်း အဟောင်းပြေစာ မပြောင်း

---

## လန်ဒင်ပေ့ချ်တွင် ဖော်ပြထားသော ၈ လုပ်ဆောင်ချက် (marketing copy)

| # | English headline | Myanmar (landing) | အက်ပ်နှင့် ကိုက်ညီမှု |
|---|------------------|-------------------|----------------------|
| 1 | Multi-Tier User Control | အဆင့်အလိုက် အသုံးပြုသူ စီမံခန့်ခွဲမှု | ✅ Admin + Staff + Superadmin |
| 2 | Dynamic Invoice Engine | အလိုအလျောက် ပြေစာဖန်တီးစနစ် | ✅ |
| 3 | Instant Local Payments | ပြည်တွင်းငွေပေးချေမှု QR | ✅ QR on invoice (not payment gateway) |
| 4 | Custom Branding | ကိုယ်ပိုင်အမှတ်တံဆိပ် | ✅ |
| 5 | Print & Export Ready | A4 + PDF | ✅ |
| 6 | Client & Product Catalog | ဖောက်သည် + ကုန်ပစ္စည်းစာရင်း | ⚠️ Client ✅ — Product catalog က company-wide CRUD မပြည့် (demo/sample quick-select) |
| 7 | Revenue & Unpaid Analytics | ဝင်ငွေ + မရရှိသေးငွေ | ✅ |
| 8 | Cloud Sync & Data Security | Cloud + အရန်သိမ်း | ⚠️ Cloud DB/S3 ရှိ — **အလိုအလျောက် backup schedule အက်ပ်ထဲ မပါ** |

### လန်ဒင်ပေ့ချ် “ကတိကဝတ်” စာသား (script မှာသတိ)

- **SAFE & SECURE DATA** — လုံခြုံရေး လုပ်ငန်းစဉ်/ hosting နှင့် ဆက်စပ်ပြောရန်  
- **24/7 TECHNICAL SUPPORT** — **အက်ပ်က support ticket မပေး** — လုပ်ငန်းလုပ်ငန်းစဉ်ဖြင့် ကတိပြုရန်  
- **AUTOMATIC CLOUD BACKUP** — **အက်ပ်က backup scheduler မပါ** — infra (`pg_dump` စသည်) ဖြင့်  

README: reusable product catalog၊ auto cloud backup scheduling၊ 24/7 support operations ကို ဝန်ဆောင်မှုမပေးမီ သီးခြား စီစဉ်ရန်။

---

## ဈေးနှုန်း အစီအစဉ်များ (script table)

| Plan | MMK | ကာလ | Bonus |
|------|-----|------|-------|
| 1 MONTH PLAN | 25,000 | ၁ လ | — |
| 3 MONTHS PLAN | 75,000 | ၃ လ | ၃ ရက် အခမဲ့ |
| 6 MONTHS PLAN | 150,000 | ၆ လ | ၇ ရက် အခမဲ့ |
| 1 YEAR PLAN | 300,000 | ၁၂ လ | ၁ လ အခမဲ့ (စုစုပေါင်း ၁၃ လ calendar logic) |

- Landing: **Choose plan** → summary copy (ငွေပေးချေမှု/activation အလိုအလျောက် မလုပ်)  
- `SALES_CONTACT_URL` → **Contact San Pya** ခလုတ်  

---

## ပစ်မှတ်အုပ်စုများ (landing)

- Freelancers / အလွတ်တန်းလုပ်ကိုင်သူများ  
- Small businesses / လုပ်ငန်းငယ်များ  
- Growing teams / တိုးတက်နေသော အဖွဲ့များ  
- B2B companies  

---

## မပါဝင်သော အရာများ (over-promise မလုပ်ရန်)

- Public self-signup  
- In-app payment / subscription checkout  
- Email ပို့ခြင်း (invoice email)  
- Public invoice sharing link  
- Exchange rate conversion  
- Recurring invoices  
- Accounting software integration  
- Printed/PDF invoice label များ — interface ဘာသာပြောင်းလည်း invoice content English template ဟု README ဖော်ပြထား  

---

## Script angle ideas (အကြံ)

1. **လုပ်ငန်းရှင် POV** — “ပြေစာနံပါတ်ရေ၊ Excel မှားတာ၊ QR မပါတာ” → San Pya တစ်ခါတည်း  
2. **မြန်မာစီးပွားရေး POV** — KPay/Wave၊ ကျပ်ငွေ၊ Yangon ရက်စွဲ  
3. **အဖွဲ့ POV** — ဘော့စ်က settings မထိ၊ staff က ပြေစ만  
4. **စမ်းသုံးခေါင်း** — Demo နှိပ်ပြီး ၂ မိနစ်အတွင်း paid/unpaid/overdue ကြည့်  
5. **စိတ်ချရမှု** — issued ပြေစာ snapshot၊ session revoke၊ company suspend  

---

## အတိုချုပ် တစ်ကြောင်း (MY)

**San Pya Invoice** သည် ကုမ္ပဏီအလိုက် သီးခြား workspace ဖြင့် ပြေစာဖန်တီးခြင်း၊ ပြည်တွင်း QR ငွေပေးချေမှု ပြသခြင်း၊ ကိုယ်ပိုင်အမှတ်တံဆိပ်၊ PDF/print၊ ဝင်ငွေခြုံငုံမြင်ကွင်းနှင့် Admin/Staff ခွင့်ပြုချက်ကို English/မြန်မာဖြင့် ပေးသော B2B ဖြေရှင်းချက်ဖြစ်ပြီး ၂၅,၀၀၀ ကျပ်မှ စတင်သည့် ကာလအလိုက် အစီအစဉ်များဖြင့် activation လုပ်ငန်းစဉ်မှတစ်ဆင့် အသုံးပြုနိုင်သည်။

## One-liner (EN)

**San Pya Invoice** is a company-isolated B2B workspace for branded invoices, local payment QR codes, PDF/print export, revenue insights, and role-based team access—offered on MMK plans from 25,000 with English and Myanmar UI.
