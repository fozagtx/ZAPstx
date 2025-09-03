# Deployment Guide

Complete deployment guide for the sBTC Marketplace application.

## 🚀 Quick Deploy

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy

3. **Environment Variables**
   Set these in Vercel dashboard:
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   UPLOADTHING_SECRET=your-uploadthing-secret
   UPLOADTHING_APP_ID=your-uploadthing-app-id
   NEXT_PUBLIC_STACKS_NETWORK=mainnet
   NEXT_PUBLIC_STACKS_API_URL=https://api.hiro.so
   ```

## 📊 Database Setup

### Production Database

#### Option 1: Neon (Recommended)
1. Visit [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `DATABASE_URL` environment variable

#### Option 2: Supabase
1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Add to `DATABASE_URL` environment variable

#### Option 3: Railway
1. Visit [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string
4. Add to `DATABASE_URL` environment variable

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

## 🔧 Smart Contract Deployment

### Prerequisites

1. **Install Clarinet**
   ```bash
   # macOS
   brew install clarinet

   # Ubuntu/Debian
   curl -L https://github.com/hirosystems/clarinet/releases/download/v1.8.0/clarinet-linux-x64.tar.gz | tar xz
   sudo mv clarinet /usr/local/bin/
   ```

2. **Setup Stacks Account**
   - Install Hiro Wallet
   - Fund account with STX for testnet/mainnet deployment

### Testnet Deployment

1. **Configure Clarinet**
   ```bash
   # Initialize if not already done
   clarinet new sbtc-contracts
   cd sbtc-contracts
   ```

2. **Deploy to Testnet**
   ```bash
   # Test contracts
   clarinet test

   # Deploy to testnet
   clarinet integrate --network testnet
   ```

3. **Update Environment Variables**
   After deployment, update `.env.local`:
   ```env
   NEXT_PUBLIC_PAYMENT_GATEWAY_CONTRACT="ST1ABC...XYZ.payment-gateway"
   NEXT_PUBLIC_ESCROW_CONTRACT="ST1ABC...XYZ.escrow"
   NEXT_PUBLIC_MARKETPLACE_CONTRACT="ST1ABC...XYZ.marketplace"
   ```

### Mainnet Deployment

1. **Fund Mainnet Account**
   - Ensure sufficient STX balance
   - Account needs gas for deployment

2. **Deploy to Mainnet**
   ```bash
   # Switch to mainnet
   clarinet integrate --network mainnet
   ```

3. **Update Production Environment**
   Set in Vercel/production:
   ```env
   NEXT_PUBLIC_STACKS_NETWORK=mainnet
   NEXT_PUBLIC_STACKS_API_URL=https://api.hiro.so
   NEXT_PUBLIC_PAYMENT_GATEWAY_CONTRACT="SP1ABC...XYZ.payment-gateway"
   ```

## 🔐 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your domain URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth encryption key | Generate with `openssl rand -base64 32` |
| `UPLOADTHING_SECRET` | UploadThing API secret | `sk_live_...` |
| `UPLOADTHING_APP_ID` | UploadThing app identifier | `your_app_id` |
| `NEXT_PUBLIC_STACKS_NETWORK` | Stacks network | `mainnet` or `testnet` |
| `NEXT_PUBLIC_STACKS_API_URL` | Stacks API endpoint | `https://api.hiro.so` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONTRACT_DEPLOYER` | Contract deployer address | Auto-detected |
| `COINMARKETCAP_API_KEY` | For price data | Not required |
| `SENTRY_DSN` | Error tracking | Not required |

## 🌐 Domain Setup

### Custom Domain

1. **Add Domain in Vercel**
   - Go to Project Settings
   - Click "Domains"
   - Add your domain

2. **Configure DNS**
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation

3. **Update Environment**
   ```env
   NEXTAUTH_URL=https://your-custom-domain.com
   ```

### SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## 📈 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for unused dependencies
npx depcheck

# Update dependencies
npm update
```

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_products_category ON "Product"("category");
CREATE INDEX idx_products_price ON "Product"("price");
CREATE INDEX idx_payments_status ON "Payment"("status");
CREATE INDEX idx_purchases_user_id ON "Purchase"("userId");
```

### Caching Strategy

1. **Static Assets**: Automatically cached by Vercel
2. **API Routes**: Implement Next.js caching
3. **Database Queries**: Use Prisma query caching

## 🔍 Monitoring & Analytics

### Error Tracking

1. **Sentry Setup**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configuration**
   ```javascript
   // sentry.client.config.js
   import * as Sentry from "@sentry/nextjs"

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   })
   ```

### Performance Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - View performance metrics

2. **Database Monitoring**
   - Monitor query performance
   - Set up alerting for slow queries

## 🧪 Testing in Production

### Smoke Tests

1. **User Registration**
   - Connect Stacks wallet
   - Complete profile setup

2. **Product Creation**
   - Upload product images
   - Set pricing and description
   - Publish product

3. **Payment Flow**
   - Purchase product with sBTC
   - Verify payment confirmation
   - Check file delivery

4. **Dashboard Access**
   - View sales analytics
   - Download product files
   - Check transaction history

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery run load-test.yml
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Test database connection
   npx prisma db push --preview-feature
   ```

2. **Smart Contract Deployment Failures**
   ```bash
   # Check network status
   curl https://api.testnet.hiro.so/v2/info

   # Verify contract syntax
   clarinet check contracts/payment-gateway.clar
   ```

3. **File Upload Issues**
   - Verify UploadThing configuration
   - Check file size limits
   - Ensure proper CORS settings

4. **Authentication Problems**
   - Verify NextAuth configuration
   - Check wallet connection
   - Ensure proper environment variables

### Logs and Debugging

1. **Vercel Function Logs**
   ```bash
   # View real-time logs
   vercel logs your-app-name
   ```

2. **Database Query Logs**
   ```javascript
   // Enable Prisma logging
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   })
   ```

3. **Stacks Network Logs**
   - Monitor transactions in Stacks Explorer
   - Check contract call status

## 📋 Pre-Launch Checklist

### Security
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] HTTPS enforced

### Performance  
- [ ] Build optimization completed
- [ ] Database indexes added
- [ ] Caching strategy implemented
- [ ] CDN configured for assets

### Functionality
- [ ] All user flows tested
- [ ] Payment system verified
- [ ] File uploads working
- [ ] Email notifications configured
- [ ] Smart contracts deployed

### Monitoring
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Database monitoring setup
- [ ] Backup strategy implemented

## 🔄 Post-Launch

### Maintenance

1. **Regular Updates**
   - Update dependencies monthly
   - Monitor security advisories
   - Apply critical patches immediately

2. **Database Maintenance**
   - Monitor query performance
   - Optimize slow queries
   - Regular backups

3. **Smart Contract Updates**
   - Monitor contract performance
   - Plan upgrades carefully
   - Test on testnet first

### Scaling

1. **Database Scaling**
   - Implement read replicas
   - Consider connection pooling
   - Monitor connection limits

2. **API Scaling**
   - Implement caching layers
   - Use background jobs for heavy tasks
   - Consider serverless functions

3. **File Storage Scaling**
   - Monitor UploadThing usage
   - Consider CDN for large files
   - Implement cleanup strategies

---

## 📞 Support

For deployment issues:
- Check the troubleshooting section above
- Review Vercel documentation
- Contact support via GitHub issues
- Join our Discord community

**Deployment completed successfully!** 🎉