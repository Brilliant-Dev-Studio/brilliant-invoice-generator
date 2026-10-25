export type LandingLocale = "en" | "my";
export const LANGUAGE_COOKIE = "brilliant_language";
export function landingLocale(value?: string): LandingLocale {
  return value === "my" ? "my" : "en";
}

const myanmar: Record<string, string> = {
  "Skip to content": "အကြောင်းအရာသို့ သွားရန်",
  "San Pya home": "စံပြ ပင်မစာမျက်နှာ",
  "Website navigation": "ဝက်ဘ်ဆိုက် လမ်းညွှန်",
  "Footer navigation": "အောက်ခြေ လမ်းညွှန်",
  Features: "လုပ်ဆောင်ချက်များ",
  Pricing: "ဈေးနှုန်းများ",
  "How it works": "အသုံးပြုပုံ",
  "Sign in": "အကောင့်ဝင်ရန်",
  "YOUR BUSINESS, A LITTLE MORE BRILLIANT": "သင့်လုပ်ငန်း ပိုမိုတောက်ပလာစေဖို့",
  "Invoice Generator": "ပြေစာဖန်တီးစနစ်",
  "ADVANCED B2B INVOICE & MANAGEMENT SOLUTION":
    "စီးပွားရေးလုပ်ငန်းများအတွက် အဆင့်မြင့် ပြေစာနှင့် စီမံခန့်ခွဲမှုစနစ်",
  "Big dreams. Busy days. Beautiful invoices.":
    "ရည်မှန်းချက်ကြီးကြီး၊ အလုပ်များတဲ့နေ့များနဲ့ သပ်ရပ်လှပတဲ့ ပြေစာများ။",
  "A happy little workspace for your clients, your team, and every payment in between.":
    "သင့်ဖောက်သည်များ၊ အဖွဲ့သားများနဲ့ ငွေပေးချေမှုတိုင်းကို တစ်နေရာတည်းမှာ လွယ်ကူစွာ စီမံလိုက်ပါ။",
  "Find your plan": "သင့်အတွက် အစီအစဉ်ရွေးရန်",
  "Meet your new workspace": "လုပ်ဆောင်ချက်များ ကြည့်ရန်",
  "From 25,000 MMK": "၂၅,၀၀၀ ကျပ်မှ စတင်၍",
  "Made for growing businesses": "တိုးတက်နေသော လုပ်ငန်းများအတွက်",
  "Illustrative invoice preview": "ပြေစာ နမူနာပုံစံ",
  "Less admin. More happy.": "အလုပ်ပိုလွယ်၊ စိတ်ပိုချမ်းသာ။",
  INVOICE: "ပြေစာ",
  "SAMPLE / 001": "နမူနာ / 001",
  "Good work deserves": "ကောင်းမွန်တဲ့ အလုပ်အတွက်",
  "a great invoice.": "သပ်ရပ်တဲ့ ပြေစာတစ်စောင်။",
  "PREPARED WITH CARE": "ဂရုတစိုက် ပြင်ဆင်ထားပါသည်",
  "Your next big idea": "သင့်စိတ်ကူးသစ်အတွက်",
  "Creative work": "ဖန်တီးမှုလုပ်ငန်း",
  "The little details": "အသေးစိတ် ဝန်ဆောင်မှုများ",
  Total: "စုစုပေါင်း",
  MMK: "ကျပ်",
  "Thank you for your business!": "ယုံကြည်အပ်နှံမှုအတွက် ကျေးဇူးတင်ပါသည်။",
  "Local payments, made easy": "ပြည်တွင်းငွေပေးချေမှု ပိုလွယ်ကူစေဖို့",
  "a little less paperwork, please.": "စာရွက်စာတမ်းအလုပ်တွေ လျှော့လိုက်ရအောင်။",
  "Designed for your business": "သင့်လုပ်ငန်းအတွက် ဖန်တီးထားပါသည်",
  "For the work you love": "သင်ချစ်မြတ်နိုးတဲ့ အလုပ်အတွက်",
  Freelancers: "အလွတ်တန်းလုပ်ကိုင်သူများ",
  "Small businesses": "လုပ်ငန်းငယ်များ",
  "Growing teams": "တိုးတက်နေသော အဖွဲ့များ",
  "B2B companies": "B2B ကုမ္ပဏီများ",
  "A LITTLE PLAN. A LOT OF POSSIBILITY.": "အစီအစဉ်တစ်ခုနဲ့ အခွင့်အလမ်းများစွာ",
  "Your pace. Your plan.": "သင့်လုပ်ငန်းနဲ့ ကိုက်ညီတဲ့ အစီအစဉ်။",
  "All the essentials in every plan. Pick how long you'd like to stay.":
    "အစီအစဉ်တိုင်းမှာ လိုအပ်တဲ့ လုပ်ဆောင်ချက်အားလုံး ပါဝင်ပါတယ်။ သင်အသုံးပြုလိုတဲ့ ကာလကို ရွေးချယ်လိုက်ပါ။",
  "Prices shown in MMK for the full plan period. Bonus time is added to your plan.":
    "ဈေးနှုန်းများသည် သတ်မှတ်ကာလတစ်ခုလုံးအတွက် မြန်မာကျပ်ဖြင့် ဖော်ပြထားခြင်းဖြစ်သည်။ အပိုဆုကာလကို ထပ်မံပေါင်းထည့်ပေးပါသည်။",
  "THE GOOD STUFF COMES STANDARD": "အစီအစဉ်တိုင်းမှာ ပြည့်စုံစွာ ပါဝင်ပါတယ်",
  "All plans include.": "အစီအစဉ်အားလုံးတွင် ပါဝင်သည်များ။",
  "Everything you need to keep business moving.":
    "သင့်လုပ်ငန်း အဆင်ပြေချောမွေ့ဖို့ လိုအပ်တာအားလုံး။",
  "Multi-Tier User Control": "အဆင့်အလိုက် အသုံးပြုသူ စီမံခန့်ခွဲမှု",
  "Company Admin & Staff Accounts":
    "ကုမ္ပဏီအုပ်ချုပ်သူနှင့် ဝန်ထမ်းအကောင့်များ",
  "Dynamic Invoice Engine": "အလိုအလျောက် ပြေစာဖန်တီးစနစ်",
  "Auto-numbering & Calculations":
    "ပြေစာနံပါတ်နှင့် တွက်ချက်မှုများ အလိုအလျောက်လုပ်ဆောင်ပေးခြင်း",
  "Instant Local Payments": "လွယ်ကူမြန်ဆန်သော ပြည်တွင်းငွေပေးချေမှု",
  "KPay / Wave / Bank QR Integration":
    "KPay / Wave / ဘဏ် QR များ ထည့်သွင်းအသုံးပြုနိုင်ခြင်း",
  "Custom Branding": "ကိုယ်ပိုင်အမှတ်တံဆိပ် ထည့်သွင်းခြင်း",
  "Company Logo & Digital Signature": "ကုမ္ပဏီလိုဂိုနှင့် ဒစ်ဂျစ်တယ်လက်မှတ်",
  "Print & Export Ready": "ပုံနှိပ်ရန်နှင့် ဖိုင်ထုတ်ယူရန် အသင့်ဖြစ်ခြင်း",
  "A4 Clean Print CSS & PDF Export":
    "သပ်ရပ်သော A4 ပုံနှိပ်ပုံစံနှင့် PDF ထုတ်ယူနိုင်ခြင်း",
  "Client & Product Catalog": "ဖောက်သည်နှင့် ကုန်ပစ္စည်းစာရင်း",
  "Quick Select Directory": "အမြန်ရွေးချယ်နိုင်သော စာရင်းစနစ်",
  "Revenue & Unpaid Analytics": "ဝင်ငွေနှင့် မရရှိသေးသောငွေစာရင်း သုံးသပ်မှု",
  "Real-time Dashboard": "လက်ရှိအခြေအနေကို ပြသသော လုပ်ငန်းခြုံငုံမြင်ကွင်း",
  "Cloud Sync & Data Security": "Cloud ဒေတာချိတ်ဆက်မှုနှင့် လုံခြုံရေး",
  "Automatic Backup": "ဒေတာအလိုအလျောက် အရန်သိမ်းဆည်းခြင်း",
  Included: "ပါဝင်သည်",
  "FROM HELLO TO YOUR FIRST INVOICE": "စတင်အသုံးပြုခြင်းမှ သင့်ပထမဆုံးပြေစာအထိ",
  "Small steps. Brilliant start.": "လွယ်ကူတဲ့ အဆင့်များနဲ့ စတင်လိုက်ပါ။",
  "Pick your happy plan": "သင့်တော်တဲ့ အစီအစဉ်ကို ရွေးပါ",
  "Choose the billing period that fits your business.":
    "သင့်လုပ်ငန်းနဲ့ ကိုက်ညီတဲ့ အသုံးပြုကာလကို ရွေးချယ်ပါ။",
  "Make it yours": "သင့်လုပ်ငန်းပုံစံအတိုင်း ပြင်ဆင်ပါ",
  "Arrange activation with your San Pya representative, then add your brand and team.":
    "စံပြ ကိုယ်စားလှယ်နှင့် ဆက်သွယ်၍ အကောင့်ဖွင့်ပြီး သင့်အမှတ်တံဆိပ်နှင့် အဖွဲ့သားများကို ထည့်သွင်းပါ။",
  "Send a little brilliance": "သပ်ရပ်တဲ့ ပြေစာတစ်စောင် ဖန်တီးပါ",
  "Create your first invoice and keep your payments beautifully in order.":
    "သင့်ပထမဆုံးပြေစာကို ဖန်တီးပြီး ငွေပေးချေမှုများကို စနစ်တကျ စီမံပါ။",
  "MORE TIME FOR WHAT YOU DO BEST":
    "သင်ကျွမ်းကျင်တဲ့ အလုပ်အတွက် အချိန်ပိုရစေဖို့",
  "Manage Invoices Smarter,": "ပြေစာများကို ပိုမိုစနစ်ကျစွာ စီမံပါ၊",
  "Grow Your Business Faster": "သင့်လုပ်ငန်းကို ပိုမိုမြန်ဆန်စွာ တိုးတက်စေပါ",
  "Manage Invoices Smarter, Grow Your Business Faster":
    "ပြေစာများကို ပိုမိုစနစ်ကျစွာ စီမံပြီး သင့်လုပ်ငန်းကို ပိုမိုမြန်ဆန်စွာ တိုးတက်စေပါ",
  "Let's make it brilliant": "စံပြ နဲ့ စတင်လိုက်ရအောင်",
  "Our commitments": "ကျွန်ုပ်တို့၏ ကတိကဝတ်များ",
  "SAFE & SECURE DATA": "ဒေတာများကို လုံခြုံစွာ ထိန်းသိမ်းပေးခြင်း",
  "24/7 TECHNICAL SUPPORT": "၂၄ နာရီ နည်းပညာအကူအညီ",
  "AUTOMATIC CLOUD BACKUP": "Cloud ပေါ်တွင် အလိုအလျောက် အရန်သိမ်းဆည်းခြင်း",
  "Explore plans": "အစီအစဉ်များ ကြည့်ရန်",
  "Sign in to your workspace": "သင့်လုပ်ငန်းအကောင့်သို့ ဝင်ရန်",
  "1 MONTH PLAN": "၁ လ အစီအစဉ်",
  "3 MONTHS PLAN": "၃ လ အစီအစဉ်",
  "6 MONTHS PLAN": "၆ လ အစီအစဉ်",
  "1 YEAR PLAN": "၁ နှစ် အစီအစဉ်",
  "3 DAYS FREE": "၃ ရက် အခမဲ့",
  "7 DAYS FREE": "၇ ရက် အခမဲ့",
  "1 MONTH FREE": "၁ လ အခမဲ့",
  "A lovely place to start": "စတင်အသုံးပြုရန် သင့်တော်သော အစီအစဉ်",
  "Settle into your rhythm": "လုပ်ငန်းကို အဆင်ပြေစွာ ဆက်လက်လုပ်ဆောင်ရန်",
  "More room to grow": "လုပ်ငန်းတိုးတက်မှုအတွက် အခွင့်အလမ်းပိုရစေရန်",
  "A whole year of possibility": "တစ်နှစ်တာလုံးအတွက် အခွင့်အလမ်းများ",
  "BEST VALUE / MOST POPULAR": "တန်ဖိုးအရှိဆုံး / လူကြိုက်အများဆုံး",
  Bonus: "အပိုဆု",
  "No bonus": "အပိုဆု မပါဝင်ပါ",
  "All features included": "လုပ်ဆောင်ချက်အားလုံး ပါဝင်သည်",
  "Choose plan": "အစီအစဉ် ရွေးရန်",
  "Your next brilliant chapter": "သင့်လုပ်ငန်း၏ တောက်ပသော အစသစ်",
  "Share your selected plan with your San Pya representative to arrange payment and activate your company workspace.":
    "ငွေပေးချေမှုနှင့် ကုမ္ပဏီအကောင့် စတင်အသုံးပြုနိုင်ရန် ရွေးချယ်ထားသော အစီအစဉ်ကို စံပြ ကိုယ်စားလှယ်ထံ ပေးပို့ပါ။",
  "Contact San Pya": "စံပြ သို့ ဆက်သွယ်ရန်",
  "Copy plan details": "အစီအစဉ်အချက်အလက် ကူးယူရန်",
  "View request details": "တောင်းဆိုချက် အသေးစိတ်ကြည့်ရန်",
  "Plan details copied. You can paste them into your message.":
    "အစီအစဉ်အချက်အလက်များကို ကူးယူပြီးပါပြီ။ သင့်မက်ဆေ့ချ်တွင် ထည့်သွင်းပေးပို့နိုင်ပါသည်။",
  "Select and copy the plan details below to share them.":
    "အောက်ပါ အစီအစဉ်အချက်အလက်များကို ရွေးချယ်ကူးယူ၍ ပေးပို့ပါ။",
  "Already have an account? Sign in": "အကောင့်ရှိပြီးပြီလား။ အကောင့်ဝင်ရန်",
  Price: "ဈေးနှုန်း",
  "I would like to activate this plan for my business.":
    "ကျွန်ုပ်၏လုပ်ငန်းအတွက် ဤအစီအစဉ်ကို စတင်အသုံးပြုလိုပါသည်။",
  "Close dialog": "ပိတ်ရန်",
  "Switch to light mode": "အလင်းရောင်ပုံစံသို့ ပြောင်းရန်",
  "Switch to dark mode": "အမှောင်ပုံစံသို့ ပြောင်းရန်",
  "Download app": "အက်ပ်ဒေါင်းလုဒ်",
  "ON YOUR PHONE & TABLET": "ဖုန်းနှင့် တက်ဘလက်တွင်",
  "Download the San Pya app": "စံပြ အက်ပ်ကို ထည့်သွင်းပါ",
  "Install San Pya on your home screen — no Play Store required. Same login, invoices, and PDF tools you already use in the browser.":
    "Play Store မလိုဘဲ Home screen သို့ စံပြ ထည့်ပါ။ Browser တွင် သုံးနေသော login၊ ပြေစာနှင့် PDF လုပ်ဆောင်ချက်များ အတူတူပဲ။",
  "Free install from your browser": "Browser မှ အခမဲ့ ထည့်သွင်းနိုင်",
  "Works on Android and iPhone / iPad": "Android နှင့် iPhone / iPad တွင် အလုပ်လုပ်",
  "Internet required — always up to date": "Internet လို — အမြဲ နောက်ဆုံးပေါ်",
  "Install app": "အက်ပ် ထည့်သွင်းရန်",
  "App installed — open from your home screen":
    "ထည့်သွင်းပြီး — Home screen မှ ဖွင့်ပါ",
  "Use the steps on the right, or open this page in Chrome on Android.":
    "ညာဘက် အဆင့်များကို လိုက်ပါ၊ သို့မဟုတ် Android Chrome တွင် ဤစာမျက်နှာကို ဖွင့်ပါ။",
  "Android (Chrome)": "Android (Chrome)",
  "Open brilliant-invoice-generator.vercel.app in Chrome":
    "Chrome တွင် brilliant-invoice-generator.vercel.app ကို ဖွင့်ပါ",
  "Tap the menu (⋮) → Install app or Add to Home screen":
    "Menu (⋮) → Install app သို့မဟုတ် Add to Home screen ကို နှိပ်ပါ",
  "Open San Pya from your home screen": "Home screen မှ စံပြ ကို ဖွင့်ပါ",
  "iPhone / iPad (Safari)": "iPhone / iPad (Safari)",
  "Open the site in Safari": "Safari တွင် ဝဘ်ဆိုက်ကို ဖွင့်ပါ",
  "Tap Share → Add to Home Screen": "Share → Add to Home Screen ကို နှိပ်ပါ",
  "Tap Add — look for the San Pya icon":
    "Add နှိပ်ပါ — စံပြ icon ကို ရှာပါ",
  "Install now": "ယခု ထည့်သွင်းရန်",
  "Install now — one tap": "ယခု ထည့်ပါ — တစ်ချက်တည်း",
  "Install on Android": "Android တွင် ထည့်သွင်းရန်",
  "Open app": "အက်ပ် ဖွင့်ရန်",
  "Installed — open San Pya": "ထည့်ပြီး — စံပြ ဖွင့်ပါ",
  "Add to Home Screen": "Home Screen သို့ ထည့်ရန်",
  "FREE · NO PLAY STORE": "အခမဲ့ · Play Store မလို",
  "Install San Pya in one tap": "တစ်ချက်နဲ့ စံပြ ထည့်ပါ",
  "Tap the button — Chrome installs the app to your home screen.":
    "ခလုတ်နှိပ်ပါ — Chrome က Home screen သို့ အက်ပ် ထည့်ပေးမည်။",
  "Ready — tap Install and confirm in Chrome":
    "အဆင်သင့် — Install နှိပ်ပြီး Chrome တွင် အတည်ပြုပါ",
  "Use Chrome on Android for the one-tap install button.":
    "တစ်ချက်ထည့် ခလုတ်အတွက် Android တွင် Chrome သုံးပါ။",
  "Almost there — Android": "နီးပါပြီ — Android",
  "Open this page in Chrome (not Facebook / TikTok browser)":
    "Chrome တွင် ဤစာမျက်နှာ ဖွင့်ပါ (Facebook / TikTok browser မဟုတ်)",
  "Tap the green Install button again":
    "အစိမ်းရောင် Install ခလုတ်ကို ထပ်နှိပ်ပါ",
  "Confirm when Chrome asks to add San Pya":
    "Chrome က စံပြ ထည့်ခိုင်းရင် အတည်ပြုပါ",
  "Same login, invoices, and PDF tools":
    "Login၊ ပြေစာနှင့် PDF တူညီသည်",
  "Manual install steps": "လက်ဖြင့် ထည့်နည်း",
  "Menu (⋮) → Install app or Add to Home screen, then open San Pya from your home screen.":
    "Menu (⋮) → Install app သို့မဟုတ် Add to Home screen၊ ပြီးရင် Home screen မှ စံပြ ဖွင့်ပါ။",
  "Share → Add to Home Screen → Add.":
    "Share → Add to Home Screen → Add။",
  "App version": "အက်ပ် ဗားရှင်း",
  "Tap Refresh below, then the green Install button again":
    "အောက်က Refresh နှိပ်ပြီး အစိမ်းရောင် Install ခလုတ်ကို ထပ်နှိပ်ပါ",
  "Or use Chrome menu (⋮) → Install app / Add to Home screen":
    "သို့မဟုတ် Chrome menu (⋮) → Install app / Add to Home screen သုံးပါ",
  "Refresh page to enable install": "ထည့်သွင်းနိုင်အောင် စာမျက်နှာ Refresh လုပ်ပါ",
  "ANDROID APP": "ANDROID APP",
  "Get San Pya on your phone": "ဖုန်းတွင် စံပြ ရယူပါ",
  "Download the APK — the app opens the same San Pya workspace you use in the browser.":
    "APK ဒေါင်းလုဒ် — အက်ပ်က browser တွင် သုံးသော စံပြ workspace ကို ဖွင့်ပေးမည်။",
  "Tap Download APK": "APK ဒေါင်းလုဒ် နှိပ်ပါ",
  "Install the file": "ဖိုင် ထည့်သွင်းပါ",
  "Open the app and sign in": "အက်ပ် ဖွင့်၍ ဝင်ပါ",
  "Or install from Chrome without APK": "APK မလို Chrome မှ ထည့်မလား",
  "On Android Chrome you can add San Pya to your home screen without downloading a file.":
    "Android Chrome တွင် ဖိုင်မဒေါင်းဘဲ Home screen သို့ ထည့်နိုင်ပါသည်။",
  "App highlights": "အက်ပ် အချက်အလက်",
  "Home screen app": "Home screen အက်ပ်",
  "Same login & invoices": "Login နှင့် ပြေစာ တူညီ",
  "Updates over the web": "ဝဘ်မှ အပ်ဒိတ်",
  "iPhone / iPad:": "iPhone / iPad:",
  "Safari → Share → Add to Home Screen":
    "Safari → Share → Add to Home Screen",
  "San Pya on your phone": "ဖုန်းတွင် စံပြ",
  "Welcome back": "ပြန်လည်ကြိုဆိုပါတယ်",
  "YOUR BUSINESS WORKSPACE": "သင့်လုပ်ငန်း စီမံခန့်ခွဲရာ",
  "Monthly revenue": "လစဉ်ဝင်ငွေ",
  "Recent invoices": "နောက်ဆုံးပြေစာများ",
  "Paid": "ပေးပြီး",
  "Draft": "မူကြမ်း",
  "ANDROID APP · WEB INSIDE": "ANDROID APP · ဝဘ်အတွင်းပါ",
  "Download the San Pya Android app": "စံပြ Android အက်ပ် ဒေါင်းလုဒ်လုပ်ပါ",
  "Install the APK like any app. Inside, you use the same San Pya website — login, invoices, and PDF.":
    "APK ကို အက်ပ်အတိုင်း ထည့်ပါ။ အတွင်းမှာ စံပြ ဝဘ်ဆိုက် တူညီ — login၊ ပြေစာ၊ PDF။",
  "Download APK — Android app": "APK ဒေါင်းလုဒ် — Android အက်ပ်",
  "Download APK": "APK ဒေါင်းလုဒ်",
  "After download: open the file → Install → open San Pya from your home screen.":
    "ဒေါင်းပြီးရင် ဖိုင် ဖွင့် → Install → Home screen မှ စံပြ ဖွင့်ပါ။",
  "Install the APK": "APK ထည့်သွင်းနည်း",
  "Tap Download APK above": "အပေါ်က APK ဒေါင်းလုဒ် နှိပ်ပါ",
  "If asked, allow install from this browser or Files app":
    "မေးရင် browser သို့မဟုတ် Files app မှ ထည့်ခွင့်ပြုပါ",
  "Open San Pya — sign in with your workspace account":
    "စံပြ ဖွင့် — လုပ်ငန်းအကောင့်ဖြင့် ဝင်ပါ",
  "No APK? Quick browser install": "APK မလို? Browser မှ အမြန် ထည့်",
  "On Android Chrome you can also add San Pya to your home screen without downloading a file.":
    "Android Chrome တွင် ဖိုင်မဒေါင်းဘဲ Home screen သို့ ထည့်နိုင်ပါသည်။",
  "Real app icon on your home screen": "Home screen တွင် အက်ပ် icon အစစ်",
  "Web updates — no reinstall for most features":
    "ဝဘ်အပ်ဒိတ် — အများစု အင်္ဂါရပ်အတွက် APK ပြန် မထည့်ရ",
};
export function translate(locale: LandingLocale, text: string): string {
  return locale === "my" ? (myanmar[text] ?? text) : text;
}
