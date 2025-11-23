# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database

**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Copy the connection string from Project Settings > Database
4. Add it to `.env` as `DATABASE_URL`

**Option B: Local PostgreSQL**
1. Install PostgreSQL
2. Create database: `CREATE DATABASE mockverse;`
3. Add connection string to `.env`

### Step 3: Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe (Get from stripe.com dashboard - Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create tables
npx prisma db push

# Seed with sample data
npm run db:seed
```

### Step 5: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎯 First Steps

1. **Sign Up**: Create an account at `/auth/signup`
2. **Login**: Use your credentials at `/auth/login`
3. **Browse Plans**: Check out pricing at `/pricing`
4. **Admin Access**: The seed script creates `admin@mockverse.com` (you'll need to set up auth)

## 📝 Important Notes

- **Stripe**: Use test mode keys (starts with `pk_test_` and `sk_test_`)
- **Database**: Make sure your database is running before starting the app
- **Admin**: To make a user admin, update the database: `UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';`

## 🐛 Common Issues

**Database connection error?**
- Check `DATABASE_URL` is correct
- Ensure database is running
- Verify network/firewall settings

**Authentication not working?**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

**Stripe checkout not working?**
- Use test mode keys only
- Verify keys are correct in `.env`

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize plans and exams in the admin panel
- Add your own questions and exams
- Deploy to Vercel for production

Happy coding! 🎉

