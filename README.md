# MockVerse - BRAC University Admission Test Preparation Platform

A comprehensive web application for BRAC University admission candidates to practice with mock exams, track their progress, and prepare effectively for admission tests.

## 🚀 Features

### User Features
- **User Authentication**: Sign up, login, and logout with email/password or Google OAuth
- **Mock Test Plans**: Browse and purchase different mock test plans
- **Online Exams**: Take timed mock exams with real-time timer
- **Results & Analytics**: View detailed results with subject-wise breakdown
- **Performance Tracking**: Track your progress across multiple exams

### Admin Features
- **Exam Management**: Create and manage mock exams
- **Question Bank**: Add and manage questions for exams
- **Dashboard**: View system statistics and analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase or local)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Payments**: Stripe (Test Mode)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (Supabase free tier recommended)
- Stripe account (for test mode)
- (Optional) Google OAuth credentials

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MockVerse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/mockverse?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Supabase (if using Supabase)
   NEXT_PUBLIC_SUPABASE_URL=""
   NEXT_PUBLIC_SUPABASE_ANON_KEY=""
   SUPABASE_SERVICE_ROLE_KEY=""
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed the database
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

### Option 1: Supabase (Recommended - Free Tier)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string and update `DATABASE_URL` in `.env`
5. Run `npx prisma db push` to create tables

### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE mockverse;
   ```
3. Update `DATABASE_URL` in `.env`
4. Run `npx prisma db push` to create tables

## 🔐 Authentication Setup

### Email/Password Authentication

The app uses NextAuth.js with credentials provider. User passwords are handled through NextAuth's built-in mechanisms.

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

## 💳 Stripe Setup

1. Create a free account at [stripe.com](https://stripe.com)
2. Go to Developers > API keys
3. Copy your test keys:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
4. Set up webhook (for production):
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

## 📁 Project Structure

```
MockVerse/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin pages
│   └── pricing/           # Pricing page
├── components/            # React components
│   └── ui/               # ShadCN UI components
├── lib/                   # Utility functions
├── prisma/                # Prisma schema and migrations
└── public/                # Static assets
```

## 🎯 Usage

### For Users

1. **Sign Up**: Create an account at `/auth/signup`
2. **Browse Plans**: View available plans at `/pricing`
3. **Purchase Plan**: Click "Purchase Plan" to checkout with Stripe
4. **Take Exams**: Go to Dashboard > Exams and start an exam
5. **View Results**: Check your results and analytics after completing an exam

### For Admins

1. **Login**: Use an admin account (created via seed script)
2. **Create Exam**: Go to Admin > Create Exam
3. **Add Questions**: Go to Admin > Add Questions
4. **Manage**: View statistics and manage content from Admin Dashboard

## 🔑 Admin Access

The seed script creates an admin user:
- Email: `admin@mockverse.com`
- You'll need to set up authentication separately

To create an admin user manually:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database is running
- Check firewall settings if using remote database

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure OAuth credentials are correct (if using Google)

### Stripe Issues
- Use test mode keys (starts with `pk_test_` and `sk_test_`)
- Verify webhook endpoint is configured correctly
- Check Stripe dashboard for payment logs

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository.

---

Built with ❤️ for BRAC University admission candidates

