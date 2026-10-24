# Operations features (team, platform, trust)

> အဖွဲ့ခွင့်ပြုချက်၊ ဘာသာစကား၊ demo၊ superadmin၊ နည်းပညာ ယုံကြည်မှု။

## အဖွဲ့ & ခွင့်ပြုချက်

| Role | အကျဉ်းချုပ် |
|------|-------------|
| **STAFF** | Clients၊ ပြေစာ create/issue၊ print/PDF (settings / paid မလုပ်) |
| **COMPANY_ADMIN** | Company settings၊ team (staff အများဆုံး ၃)， accounts |
| **SUPERADMIN** | `/superadmin` — ကုမ္ပဏီများ၊ subscription၊ audit |

- Login: email သို့မဟုတ် optional phone
- Login lockout — ၁၅ မိနစ်
- Session — ၈ နာရီ JWT၊ suspend/password reset ဖြင့် revoke
- Session monitor — focus / ၁၅ စက္ကန့် recheck

## ဘာသာစကား & UI

- English / မြန်မာ (`brilliant_language` cookie)
- Light / Dark — landing + workspace
- Mascot companion၊ validation toasts

## Demo sandbox

- **Try Demo** — sample clients၊ MMK product quick-add၊ invoices ၄ state
- Daily cron reset + `npm run db:seed:demo`
- Demo: no image upload / no admin

## Platform owner (Superadmin)

- Overview charts (၆/၁၂ လ)， plan value
- Companies — search, suspend, profile, users, plans
- Subscriptions — assign, renewals, MMK catalog
- Accounts — create / suspend / password reset
- Activity audit log (Yangon time)
- Company suspend → tenant sessions revoked

## Trust talking points

- PostgreSQL — company-isolated data
- Private S3 uploads (PNG/JPEG/WebP, size limits)
- Server-side authorization
- Issued invoice snapshots — branding ပြောင်းလဲပြီးလည်း အဟောင်း မပြောင်း
