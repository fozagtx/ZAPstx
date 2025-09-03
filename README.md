# sBTC Marketplace

A premium digital marketplace built on Bitcoin L2 with sBTC payments, featuring glassmorphism UI, smart contracts, and embeddable payment widgets.

## 🌟 Features

### Core Functionality
- **Digital Marketplace**: Buy and sell digital products with sBTC
- **Smart Contracts**: Secure payments with escrow functionality
- **Stacks Integration**: Native Bitcoin L2 blockchain support
- **Embeddable Widgets**: Payment widgets for any website
- **Premium UI**: Glassmorphism design with smooth animations

### Payment System
- **sBTC Payments**: Native Bitcoin L2 transactions
- **Escrow Protection**: Smart contract-based buyer protection
- **Real-time Pricing**: Live BTC/USD conversion rates
- **Multi-format Support**: Digital files, images, documents

### Dashboard & Analytics
- **Revenue Analytics**: Comprehensive sales tracking
- **Product Management**: Upload and manage digital products
- **User Profiles**: Complete seller and buyer profiles
- **Transaction History**: Detailed payment records

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL database
- Stacks wallet (Hiro Wallet recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sbtc-marketplace
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/sbtc_marketplace"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # UploadThing
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   
   # Stacks Network
   NEXT_PUBLIC_STACKS_NETWORK="testnet" # or "mainnet"
   NEXT_PUBLIC_STACKS_API_URL="https://api.testnet.hiro.so"
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your marketplace.

## 📁 Project Structure

```
sbtc-marketplace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── marketplace/       # Marketplace pages
│   │   └── product/           # Product pages
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── common/            # Shared components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── marketplace/       # Marketplace components
│   │   ├── payment/           # Payment widgets
│   │   └── ui/                # Shadcn/UI components
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Database connection
│   │   ├── stacks.ts          # Stacks blockchain utils
│   │   └── utils.ts           # General utilities
│   └── styles/                # Global styles
├── contracts/                 # Clarity smart contracts
├── prisma/                    # Database schema and migrations
└── public/                    # Static assets
```

## 🔧 Configuration

### Database Setup

The application uses PostgreSQL with Prisma ORM. The schema includes:

- **Users**: Profile, wallet addresses, reputation
- **Products**: Digital goods with metadata
- **Payments**: sBTC transaction records
- **Purchases**: Order history and delivery
- **Reviews**: Product feedback system

### Smart Contracts

Located in `/contracts/`, written in Clarity:

- **payment-gateway.clar**: Main payment processing
- **escrow.clar**: Buyer protection system
- **marketplace.clar**: Product listings and metadata

Deploy contracts:
```bash
pnpm contracts:test    # Run tests
pnpm contracts:deploy  # Deploy to testnet
```

### File Upload

Uses UploadThing for secure file storage:

1. Create account at [uploadthing.com](https://uploadthing.com)
2. Add your API keys to `.env.local`
3. Configure file types in `/src/app/api/uploadthing/core.ts`

## 💳 Payment Integration

### sBTC Payments

The marketplace uses sBTC (Bitcoin L2) for all transactions:

1. **Connect Wallet**: Users connect Hiro or Leather wallet
2. **Price Conversion**: Real-time BTC/USD rates
3. **Smart Contract**: Escrow protection via Clarity
4. **Instant Settlement**: Fast L2 transactions

### Payment Widgets

Embeddable payment widgets for external sites:

```javascript
// Basic widget
<iframe 
  src="https://your-marketplace.com/widget/embed?productId=123"
  width="400"
  height="600"
  frameborder="0">
</iframe>
```

Customize with parameters:
- `theme`: light, dark, auto
- `primaryColor`: hex color code
- `borderRadius`: none, small, medium, large
- `compactMode`: true/false

## 📊 Analytics & Dashboard

### Seller Dashboard

- **Revenue Tracking**: Daily, weekly, monthly sales
- **Product Performance**: Views, conversions, ratings
- **Customer Insights**: Buyer demographics and behavior
- **Payout Management**: sBTC withdrawal tracking

### Admin Features

- **Marketplace Metrics**: Total volume, active users
- **Content Moderation**: Product approval workflow
- **Transaction Monitoring**: Payment status tracking
- **User Management**: Account verification and support

## 🎨 UI/UX Features

### Design System

- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Color Palette**: Custom brand colors with dark/light modes
- **Typography**: Inter font with proper hierarchy
- **Animations**: Framer Motion for smooth transitions

### Components

All components built with:
- **Shadcn/UI**: Accessible, customizable components
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile-first approach

## 🔒 Security

### Authentication

- **NextAuth.js**: Session management
- **Stacks Wallet**: Blockchain identity verification
- **CSRF Protection**: Built-in request validation
- **Rate Limiting**: API abuse prevention

### Smart Contract Security

- **Escrow Protection**: Funds held until delivery
- **Multi-signature**: Admin controls for disputes
- **Audit Trail**: All transactions recorded on-chain
- **Emergency Stops**: Circuit breakers for security

## 🚀 Deployment

### Vercel Deployment

1. **Connect repository** to Vercel
2. **Set environment variables** in dashboard
3. **Deploy** automatically on push

### Database Migration

```bash
# Production database setup
pnpm db:migrate
pnpm db:generate
```

### Smart Contract Deployment

```bash
# Deploy to mainnet
STACKS_NETWORK=mainnet pnpm contracts:deploy
```

### Environment Variables

Production environment requires:
- Database connection string
- NextAuth secret and URL
- UploadThing credentials
- Stacks network configuration

## 📝 API Documentation

### Authentication Endpoints

```
POST /api/auth/signin       # Sign in with Stacks wallet
POST /api/auth/signout      # Sign out user
GET  /api/auth/session      # Get current session
```

### Product Endpoints

```
GET    /api/products        # List products with filters
POST   /api/products        # Create new product
GET    /api/products/[id]   # Get product details
PUT    /api/products/[id]   # Update product
DELETE /api/products/[id]   # Delete product
```

### Payment Endpoints

```
POST /api/payments/create   # Create payment intent
POST /api/payments/confirm  # Confirm payment
GET  /api/payments/[id]     # Get payment status
```

### Upload Endpoints

```
POST /api/uploadthing/productImage    # Upload product images
POST /api/uploadthing/productFile     # Upload product files
POST /api/uploadthing/avatar          # Upload user avatars
```

## 🛠 Development

### Code Style

- **ESLint**: Configured for Next.js and TypeScript
- **Prettier**: Code formatting (configured in `.prettierrc`)
- **TypeScript**: Strict mode enabled

### Testing

```bash
# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Test smart contracts
pnpm contracts:test
```

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📧 Support

For support and questions:

- **Documentation**: [docs.sbtc-marketplace.com](https://docs.sbtc-marketplace.com)
- **Issues**: GitHub Issues
- **Discord**: [Community Server](https://discord.gg/sbtc-marketplace)
- **Email**: support@sbtc-marketplace.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stacks Foundation**: For the amazing Bitcoin L2 infrastructure
- **Hiro**: For excellent developer tools and documentation
- **Shadcn**: For the beautiful UI component system
- **Vercel**: For seamless deployment and hosting
- **Community**: For feedback and contributions

---

**Built with ❤️ for the Stacks ecosystem**
