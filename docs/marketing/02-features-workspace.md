# Workspace features (invoices & branding)

> အက်ပ်ထဲတွင် ရှိပြီး သုံးနိုင်သော လုပ်ဆောင်ချက်များ — ပြေစာ၊ print၊ clients၊ settings။

## ပြေစာ (Invoice)

- **Draft → Issue → Paid** လုပ်ငန်းစဉ် (issued ပြေစာကို မပြင်နိုင် — snapshot)
- **အလိုအလျောက် ပြေစာနံပါတ်** — ကုမ္ပဏီ + နှစ်အလိုက် sequence (PostgreSQL transaction)
- **လိုင်း ၁၀၀ အထိ** — ပစ္စည်း/ဝန်ဆောင်မှု၊ အရေအတွက် (၃ ဒသမအထိ)， တစ်ခုချင်းစျေးနှုန်း
- **လျှော့စျေး** — ရာခိုင်နှုန်း (%) သို့မဟုတ် ပုံသေပမာဏ
- **အခွန်** — လျှော့စျေးနောက်မှ တွက်ချက်ခြင်း
- **ငွေကြေး** — MMK, USD, THB (ပြောင်းလဲနှုန်း မတွက်ပါ)
- **စာရင်းဇယား** — Draft / Unpaid / Paid / Overdue (**Asia/Yangon** ရက်စွဲ)
- **ငွေပေးချေနည်း** — KPay / WavePay / Bank + QR ပြသခြင်း
- **Client** — ပြေစာတည်းဖြတ်သူထဲမှ ရွေးချယ် / အသစ်ထည့်
- **Revision check** — draft conflict ကာကွယ်

## ပြေစာပုံစံ (Design)

- Template ၁၀ မျိုး (Studio, Minimal, Classic, Executive, Editorial, Ledger, Modern, Boutique, Corporate, Signature)
- Light / Dark theme၊ accent color (contrast စစ်)
- Settings နှင့် ပြေစာတစ်ခုချင်းတွင် design သိမ်းနိုင်

## Print & PDF

- Browser print — A4-friendly CSS
- PDF download — print route နှင့် component တူ
- Logo, signature, QR — authenticated fetch
- Demo workspace — watermark on print/PDF

## ဖောက်သည် (Clients)

- စာရင်း စီမံခန့်ခွဲခြင်း — အမည်၊ email၊ လိပ်စာ၊ ဖုန်း

## ကုမ္ပဏီ ပရိုဖိုင်

- ကုမ္ပဏီအချက်အလက်၊ Tax ID
- Logo (upload + crop)， signature (upload သို့မဟုတ် canvas ဆွဲ)
- KPay / WavePay / Bank QR (S3)
- Default invoice appearance
- Financial overview override (dashboard တန်ဖိုးများ လက်ဖြင်း)

## Dashboard & Analytics

- ၆ လ လစဉ် paid revenue chart (ငွေကြေးရွေးချယ်)
- Collected, outstanding, overdue, drafts
- Priority hints၊ financial overview settings page
