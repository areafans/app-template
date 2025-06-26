# 🚀 Full-Stack App Template

A world-class, production-ready app template built with modern technologies and best practices.

## ✨ Features

### 🔐 Authentication & Authorization
- **NextAuth.js** with Google, Apple, and email/password providers
- **Role-based access control** (Admin, Child, Parent, Supporter, Partner)
- **Secure middleware** for route protection
- **JWT sessions** with automatic refresh

### 💳 Payment Integration
- **Stripe** integration for payments, subscriptions, and donations
- **Webhook handling** for payment events
- **Multiple payment types** support
- **Secure payment processing**

### 🛡️ Security
- **CSRF protection** and rate limiting
- **Data encryption/decryption** utilities
- **Input sanitization** and validation
- **IP blocking** and attempt tracking
- **Security headers** and CSP

### 🎨 Modern UI
- **Tailwind CSS** with **shadcn/ui** components
- **Responsive design** ready
- **Dark mode** support
- **Professional components**

### 🗄️ Database
- **PostgreSQL** with **Prisma ORM**
- **Type-safe** database operations
- **Comprehensive schema** with relationships
- **Audit logging** system

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **UI Components**: shadcn/ui
- **Deployment**: Vercel-ready

## 📋 **New Project? Start Here!**

**🎯 For detailed guidance on using this template for new projects, see [TEMPLATE_USAGE_GUIDE.md](./TEMPLATE_USAGE_GUIDE.md)**

**🎨 For UI/UX design decisions and implementation strategies, see [UI_UX_DESIGN_GUIDE.md](./UI_UX_DESIGN_GUIDE.md)**

These guides cover:
- Step-by-step setup process
- How to work effectively with Claude as your coding assistant
- Design decisions and visual identity implementation
- Asset creation vs library usage strategies
- Responsive design and component customization
- Common customization scenarios and workflows

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account
- Google/Apple OAuth apps (optional)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd app-template
npm install
```

### 2. Environment Setup

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY="your-64-character-hex-encryption-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 4. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── payments/      # Payment processing
│   │   ├── users/         # User management
│   │   └── webhooks/      # External webhooks
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication config
│   ├── db.ts            # Database client
│   ├── stripe.ts        # Payment processing
│   ├── security.ts      # Security utilities
│   └── utils.ts         # General utilities
├── types/               # TypeScript definitions
└── middleware.ts        # Next.js middleware
prisma/
└── schema.prisma        # Database schema
```

## 🔧 Configuration

### User Roles

The template supports 5 user roles:

- **ADMIN**: Full system access
- **PARENT**: Parent portal access
- **CHILD**: Child-specific features
- **SUPPORTER**: Supporter features
- **PARTNER**: Partner portal access

### Payment Configuration

Update Stripe price IDs in `src/lib/stripe.ts`:

```typescript
export const SUBSCRIPTION_PLANS = {
  basic: {
    priceId: 'price_your_basic_plan', // Replace with actual Stripe price ID
    // ...
  },
  // ...
}
```

### Security Configuration

- Generate a secure encryption key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Configure CORS and CSP in `src/lib/security.ts`
- Set up rate limiting in middleware

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Environment Variables for Production

Ensure these are set in your deployment:

- `DATABASE_URL`
- `NEXTAUTH_URL` 
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- Stripe keys
- OAuth credentials

## 🧪 Testing

```bash
# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `GET /api/auth/session` - Get current session

### Users

- `GET /api/users` - List users (Admin only)
- `GET /api/users/[id]` - Get user profile
- `PATCH /api/users/[id]` - Update user

### Payments

- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/create-subscription` - Create subscription

### Notifications

- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue

---

Built with ❤️ using modern web technologies.