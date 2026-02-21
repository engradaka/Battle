# NBK Battle - Quiz Game Application

A bilingual (Arabic/English) quiz game platform built with Next.js and Supabase.

## Features

- 🎮 Interactive quiz game with team competition
- 🌐 Full Arabic and English support
- 📊 Admin dashboard for content management
- 📁 Bulk import via Excel/CSV
- 🎯 Multiple question types (text, image, video, audio)
- 📈 Game analytics and reporting
- 🔐 Secure authentication and authorization
- 💎 Diamond-based scoring system

## Tech Stack

- **Framework**: Next.js 15.4.5
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Supabase Auth

## Quick Start

See [SETUP.md](./SETUP.md) for complete setup instructions.

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials to .env.local

# Run development server
npm run dev
```

## Documentation

- [SETUP.md](./SETUP.md) - Complete setup guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database migration guide
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment configuration
- [DATABASE_RECOVERY_GUIDE.md](./DATABASE_RECOVERY_GUIDE.md) - Emergency recovery procedures

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Admin dashboard
│   ├── game/              # Quiz game interface
│   ├── login/             # Authentication
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── dashboard/        # Dashboard-specific components
├── lib/                   # Utility functions
├── scripts/               # Database migration scripts
└── database/              # Legacy SQL files (for reference)
```

## Security

- All dependencies pinned to specific versions
- Server-side authentication in middleware
- Environment variables for sensitive data
- Security headers configured
- Regular security updates

## License

Private - All rights reserved

## Support

For issues or questions, refer to the documentation files or contact the development team.
