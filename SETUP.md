# Complete Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd NBKBattle-main
npm install
```

## 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MASTER_ADMIN_EMAIL=admin@example.com
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Database Setup

Follow the instructions in `DATABASE_SETUP.md` to set up your database schema.

## 4. Create Admin User

1. Go to your Supabase dashboard
2. Navigate to Authentication → Users
3. Click "Add user"
4. Enter the same email you used in `NEXT_PUBLIC_MASTER_ADMIN_EMAIL`
5. Set a secure password
6. Click "Create user"

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. First Login

1. Navigate to `/login`
2. Use the admin credentials you created
3. You should be redirected to the master dashboard

## 7. Deploy to Production

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MASTER_ADMIN_EMAIL`
5. Deploy

## Troubleshooting

### "Missing environment variables" error
- Ensure `.env.local` exists and has all required variables
- Restart the dev server after adding variables

### Cannot login
- Verify the user exists in Supabase Authentication
- Check that the email matches `NEXT_PUBLIC_MASTER_ADMIN_EMAIL`
- Clear browser cache and cookies

### Database errors
- Ensure all migration scripts ran successfully
- Check Supabase logs for detailed error messages

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run build`

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never commit API keys to version control
- [ ] Use strong passwords for admin accounts
- [ ] Enable RLS policies in production
- [ ] Keep dependencies updated: `npm update`
- [ ] Review Supabase security settings

## Support

For issues, check:
1. `DATABASE_RECOVERY_GUIDE.md` for database issues
2. `SECURITY_UPDATE.md` for security updates
3. Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
