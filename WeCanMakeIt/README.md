# 🌊 WeCanMakeIt — Production SaaS Agency Website

> A $10,000+ premium digital agency website. Stunning tsunami animations, touchable canvas backgrounds, full-stack backend, dual payment gateways, JWT auth, and Nodemailer contact system.

---

## ✨ Live Preview
Open `index.html` directly in any browser for an instant full-featured preview — **no build step required**.

---

## 🎨 Brand Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Dark Teal | `#027373` | Primary buttons, gradients |
| Green | `#038C7F` | Accents, hover states |
| Soft Mint | `#A9D9D0` | Text highlights, particles |
| Light Beige | `#F2E7DC` | Hero title, light mode bg |
| Deep Black | `#0D0D0D` | Dark backgrounds |

---

## 📂 Full Project Structure

```
WeCanMakeIt/
├── index.html                    ← Complete SPA (open in browser instantly!)
├── README.md
├── .env.example
│
├── backend/
│   ├── server.js                 ← Express entry point
│   ├── package.json
│   ├── controllers/
│   │   ├── authController.js     ← Register, login, JWT refresh
│   │   ├── contactController.js  ← Nodemailer + MongoDB save
│   │   └── paymentController.js  ← Stripe + Razorpay + webhooks
│   ├── routes/
│   │   ├── auth.js
│   │   ├── contact.js
│   │   └── payment.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Contact.js
│   │   └── Payment.js
│   ├── middleware/
│   │   ├── auth.js               ← JWT verification
│   │   ├── admin.js              ← Role-based access
│   │   ├── validate.js           ← express-validator errors
│   │   └── errorHandler.js       ← Global error handler
│   └── config/
│       └── mailer.js             ← Nodemailer transporter
│
└── frontend/                     ← Next.js App (production build)
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx           ← Home
        │   ├── about/page.tsx
        │   ├── services/page.tsx
        │   ├── projects/page.tsx
        │   ├── products/page.tsx
        │   ├── contact/page.tsx
        │   └── globals.css
        └── components/
            ├── Navbar.tsx
            ├── Footer.tsx
            ├── Hero.tsx
            ├── BackgroundCanvas.tsx   ← Particle + ripple system
            ├── ServiceCard.tsx
            ├── ProjectCard.tsx
            ├── ProductCard.tsx
            ├── PricingCard.tsx
            └── ContactForm.tsx
```

---

## 🚀 Quick Start

### Option A — Instant Preview (30 seconds)
```bash
# Just open index.html in Chrome, Firefox, or Safari
open index.html
```
All 6 pages, all animations, all interactive features work immediately.

---

### Option B — Full Stack (Backend + Frontend)

#### Prerequisites
- **Node.js** 18+
- **MongoDB** (Atlas free tier works perfectly)
- **Stripe** account (stripe.com)
- **Razorpay** account (razorpay.com)
- **Gmail** account with App Password enabled

---

#### 1. Backend Setup
```bash
cd backend
npm install

# Copy and fill environment variables
cp ../.env.example .env
nano .env   # or open in VS Code

# Start development server
npm run dev
# → API running at http://localhost:5000
```

#### 2. Test the API
```bash
# Health check
curl http://localhost:5000/api/health

# Register admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Admin@1234"}'
```

#### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install

# Create frontend env
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_id
EOF

npm run dev
# → Frontend at http://localhost:3000
```

---

## 💳 Payment Integration

### Stripe Setup
1. Create account → [stripe.com](https://stripe.com)
2. Dashboard → Developers → API Keys → copy `Secret key` + `Publishable key`
3. For webhooks: Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/payment/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy `Signing secret` → set as `STRIPE_WEBHOOK_SECRET`

### Razorpay Setup
1. Create account → [razorpay.com](https://razorpay.com)
2. Dashboard → Settings → API Keys → Generate Test Key
3. Copy `Key ID` and `Key Secret`

### Test Cards
| Card | Number |
|------|--------|
| Stripe (success) | 4242 4242 4242 4242 |
| Stripe (fail) | 4000 0000 0000 0002 |
| Razorpay (UPI) | success@razorpay |

---

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Go to **Google Account → Security → App Passwords**
3. Select "Mail" → "Other" → name it "WeCanMakeIt"
4. Copy the 16-character password → set as `SMTP_PASS`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT (access + refresh tokens) |
| Password hashing | bcrypt (12 rounds) |
| HTTP headers | Helmet.js |
| Rate limiting | express-rate-limit (200 global, 20 auth/contact) |
| Input validation | express-validator on all POST routes |
| CORS | Whitelist-only origins |
| Injection protection | Mongoose schema validation |
| Webhook validation | HMAC-SHA256 signature (both gateways) |

---

## 🌐 Deployment

### Frontend → Vercel (free)
```bash
cd frontend
npx vercel --prod
# Set env vars in Vercel dashboard
```

### Backend → Railway (free tier)
```bash
# Push backend/ to GitHub
# Connect repo to railway.app
# Add env vars in Railway dashboard
# Railway auto-detects Node.js
```

### MongoDB → Atlas (free tier)
```bash
# 1. Create cluster at cloud.mongodb.com
# 2. Network Access → Add IP (0.0.0.0/0 for Railway)
# 3. Database Access → Create user
# 4. Connect → Drivers → copy connection string
# 5. Set as MONGODB_URI in Railway
```

---

## 🌊 Key Features

| Feature | Details |
|---------|---------|
| Tsunami title animation | 3D rotateX + skew + blur reveal per word |
| Touchable background | Canvas ripple system — mouse move + click + touch |
| Particle network | 80 particles with connection lines, orbital blobs |
| Custom cursor | Lag-following ring with hover state expansion |
| Dark/Light mode | System-aware toggle, persists all animations |
| Project search | Real-time filter by name + category |
| Payment flow | Stripe PaymentIntents + Razorpay Orders + webhooks |
| Contact emails | Admin notification + auto-reply to user |
| Scroll reveals | IntersectionObserver staggered animations |
| Responsive | Mobile-first, works from 320px to 4K |

---

## 📦 Backend Dependencies

```
express, mongoose, jsonwebtoken, bcryptjs,
nodemailer, stripe, razorpay, helmet,
cors, express-rate-limit, express-validator,
morgan, dotenv
```

---

## 🤝 Contact

**WeCanMakeIt** | Kalyani Nagar, Pune, Maharashtra 411006, India  
📧 hello@wecanmakeit.in | 📞 +91 98765 43210

---

*Built with ❤️ in Pune, India — © 2025 WeCanMakeIt. All rights reserved.*
