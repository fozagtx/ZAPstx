# API Documentation

Complete API reference for the sBTC Marketplace application.

## 🌐 Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## 🔐 Authentication

All protected endpoints require authentication. The API uses NextAuth.js sessions.

### Authentication Header
```http
Cookie: next-auth.session-token=your-session-token
```

### Authentication Status
```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://...",
    "walletAddress": "SP1ABC...XYZ"
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

## 👤 User Management

### Get Current User Profile
```http
GET /api/user/profile
```

**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "walletAddress": "SP1ABC...XYZ",
  "bio": "Digital creator and developer",
  "avatar": "https://...",
  "reputation": 4.8,
  "totalSales": 15000,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update User Profile
```http
PUT /api/user/profile
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Updated bio",
  "avatar": "https://new-avatar-url.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Smith",
    "bio": "Updated bio",
    "avatar": "https://new-avatar-url.com"
  }
}
```

## 🛍️ Products

### List Products
```http
GET /api/products?page=1&limit=20&category=ui-kits&sort=price&order=asc&search=react
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `category`: Filter by category
- `sort`: Sort field (price, createdAt, title, sales)
- `order`: Sort order (asc, desc)
- `search`: Search term
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `featured`: Filter featured products (true/false)

**Response:**
```json
{
  "products": [
    {
      "id": "prod_123",
      "title": "Premium React UI Kit",
      "description": "Beautiful components...",
      "price": 0.025,
      "currency": "sBTC",
      "category": "ui-kits",
      "images": ["https://..."],
      "files": ["https://..."],
      "featured": true,
      "sales": 150,
      "rating": 4.9,
      "seller": {
        "id": "user_456",
        "name": "Jane Smith",
        "avatar": "https://..."
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Single Product
```http
GET /api/products/[id]
```

**Response:**
```json
{
  "id": "prod_123",
  "title": "Premium React UI Kit",
  "description": "Complete description...",
  "price": 0.025,
  "currency": "sBTC",
  "category": "ui-kits",
  "images": ["https://..."],
  "files": ["https://..."],
  "featured": true,
  "sales": 150,
  "rating": 4.9,
  "reviews": [
    {
      "id": "review_123",
      "rating": 5,
      "comment": "Excellent quality!",
      "user": {
        "name": "Bob Johnson",
        "avatar": "https://..."
      },
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "seller": {
    "id": "user_456",
    "name": "Jane Smith",
    "avatar": "https://...",
    "reputation": 4.8
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Product
```http
POST /api/products
Content-Type: application/json
Authorization: Required
```

**Request Body:**
```json
{
  "title": "New UI Kit",
  "description": "Amazing components for React",
  "price": 0.030,
  "currency": "sBTC",
  "category": "ui-kits",
  "images": ["https://image1.com", "https://image2.com"],
  "files": ["https://file1.com"],
  "tags": ["react", "typescript", "tailwind"],
  "featured": false
}
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "prod_789",
    "title": "New UI Kit",
    "price": 0.030,
    "status": "pending"
  }
}
```

### Update Product
```http
PUT /api/products/[id]
Content-Type: application/json
Authorization: Required
```

**Request Body:**
```json
{
  "title": "Updated UI Kit",
  "price": 0.035,
  "description": "Updated description"
}
```

### Delete Product
```http
DELETE /api/products/[id]
Authorization: Required
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## 💳 Payments

### Create Payment Intent
```http
POST /api/payments/create
Content-Type: application/json
Authorization: Required
```

**Request Body:**
```json
{
  "productId": "prod_123",
  "quantity": 1,
  "email": "buyer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "pay_456",
  "amount": 0.025,
  "currency": "sBTC",
  "contractAddress": "SP1ABC...XYZ",
  "functionName": "create-payment",
  "functionArgs": ["u123456", "u25000"],
  "status": "pending"
}
```

### Confirm Payment
```http
POST /api/payments/confirm
Content-Type: application/json
Authorization: Required
```

**Request Body:**
```json
{
  "paymentId": "pay_456",
  "transactionId": "0xabc123...",
  "blockHeight": 123456
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_456",
    "status": "completed",
    "transactionId": "0xabc123...",
    "downloadUrl": "https://secure-download-link.com"
  }
}
```

### Get Payment Status
```http
GET /api/payments/[id]
Authorization: Required
```

**Response:**
```json
{
  "id": "pay_456",
  "status": "completed",
  "amount": 0.025,
  "currency": "sBTC",
  "transactionId": "0xabc123...",
  "product": {
    "id": "prod_123",
    "title": "Premium React UI Kit"
  },
  "createdAt": "2024-01-01T10:00:00.000Z",
  "completedAt": "2024-01-01T10:05:00.000Z"
}
```

### List User Payments
```http
GET /api/payments?page=1&limit=20&status=completed
Authorization: Required
```

**Response:**
```json
{
  "payments": [
    {
      "id": "pay_456",
      "status": "completed",
      "amount": 0.025,
      "product": {
        "title": "Premium React UI Kit",
        "image": "https://..."
      },
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 50,
    "pages": 5
  }
}
```

## 🔄 Purchases

### Get User Purchases
```http
GET /api/purchases?page=1&limit=20
Authorization: Required
```

**Response:**
```json
{
  "purchases": [
    {
      "id": "purchase_789",
      "product": {
        "id": "prod_123",
        "title": "Premium React UI Kit",
        "image": "https://..."
      },
      "amount": 0.025,
      "currency": "sBTC",
      "downloadUrl": "https://secure-download.com",
      "downloadCount": 3,
      "maxDownloads": 10,
      "purchasedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 25,
    "pages": 3
  }
}
```

### Download Product File
```http
GET /api/purchases/[id]/download
Authorization: Required
```

**Response:**
- Redirects to secure download URL
- Updates download count
- Returns 403 if download limit exceeded

## ⭐ Reviews

### Create Review
```http
POST /api/reviews
Content-Type: application/json
Authorization: Required
```

**Request Body:**
```json
{
  "productId": "prod_123",
  "rating": 5,
  "comment": "Excellent quality components!"
}
```

**Response:**
```json
{
  "success": true,
  "review": {
    "id": "review_456",
    "rating": 5,
    "comment": "Excellent quality components!",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Get Product Reviews
```http
GET /api/products/[id]/reviews?page=1&limit=10&sort=newest
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_456",
      "rating": 5,
      "comment": "Excellent quality components!",
      "user": {
        "name": "John Doe",
        "avatar": "https://..."
      },
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 50,
    "pages": 5
  },
  "averageRating": 4.8
}
```

## 📊 Analytics

### Seller Dashboard Stats
```http
GET /api/analytics/seller
Authorization: Required
```

**Response:**
```json
{
  "overview": {
    "totalRevenue": 1.5,
    "totalSales": 60,
    "totalProducts": 8,
    "averageRating": 4.7
  },
  "recentSales": [
    {
      "productTitle": "React UI Kit",
      "amount": 0.025,
      "buyer": "john@example.com",
      "date": "2024-01-01T10:00:00.000Z"
    }
  ],
  "topProducts": [
    {
      "id": "prod_123",
      "title": "Premium React UI Kit",
      "sales": 25,
      "revenue": 0.625
    }
  ],
  "revenueChart": [
    {
      "date": "2024-01-01",
      "revenue": 0.125,
      "sales": 5
    }
  ]
}
```

### Admin Analytics
```http
GET /api/analytics/admin
Authorization: Required (Admin only)
```

**Response:**
```json
{
  "overview": {
    "totalUsers": 1250,
    "totalProducts": 450,
    "totalRevenue": 125.5,
    "totalTransactions": 5000
  },
  "userGrowth": [
    {
      "date": "2024-01-01",
      "users": 100,
      "newUsers": 15
    }
  ],
  "revenueByCategory": [
    {
      "category": "ui-kits",
      "revenue": 45.2,
      "percentage": 36
    }
  ]
}
```

## 📁 File Upload

### Upload Product Images
```http
POST /api/uploadthing/productImage
Content-Type: multipart/form-data
Authorization: Required
```

**Request:**
- Form data with image files
- Max 5 files, 4MB each
- Supported: JPG, PNG, WebP

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "url": "https://uploadthing.com/f/abc123.jpg",
      "name": "product-image.jpg",
      "size": 1024000,
      "key": "abc123"
    }
  ]
}
```

### Upload Product Files
```http
POST /api/uploadthing/productFile
Content-Type: multipart/form-data
Authorization: Required
```

**Request:**
- Form data with product files
- Max 1 file, 32MB for ZIP
- Supported: ZIP, PDF, Images, Text files

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "url": "https://uploadthing.com/f/xyz789.zip",
      "name": "ui-kit.zip",
      "size": 15728640,
      "key": "xyz789"
    }
  ]
}
```

## 🔍 Search

### Search Products
```http
GET /api/search?q=react&category=ui-kits&minPrice=0.01&maxPrice=0.05
```

**Response:**
```json
{
  "results": [
    {
      "id": "prod_123",
      "title": "Premium React UI Kit",
      "price": 0.025,
      "image": "https://...",
      "seller": "Jane Smith",
      "rating": 4.9,
      "relevanceScore": 0.95
    }
  ],
  "facets": {
    "categories": [
      {"name": "ui-kits", "count": 15},
      {"name": "templates", "count": 8}
    ],
    "priceRanges": [
      {"min": 0.01, "max": 0.02, "count": 5},
      {"min": 0.02, "max": 0.05, "count": 12}
    ]
  },
  "total": 23
}
```

## 🏷️ Categories

### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "categories": [
    {
      "id": "ui-kits",
      "name": "UI Kits",
      "description": "Pre-built component libraries",
      "productCount": 156,
      "featured": true
    },
    {
      "id": "templates",
      "name": "Templates",
      "description": "Ready-to-use website templates",
      "productCount": 89,
      "featured": true
    }
  ]
}
```

## 📈 Webhooks

### Payment Webhook
```http
POST /api/webhooks/payment
Content-Type: application/json
X-Webhook-Secret: your-webhook-secret
```

**Payload:**
```json
{
  "event": "payment.completed",
  "data": {
    "paymentId": "pay_456",
    "transactionId": "0xabc123...",
    "amount": 0.025,
    "productId": "prod_123",
    "buyerId": "user_789"
  },
  "timestamp": "2024-01-01T10:05:00.000Z"
}
```

## ❌ Error Responses

### Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "price",
      "reason": "Price must be greater than 0"
    }
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |

## 🔄 Rate Limiting

### Limits
- **Authentication**: 5 requests per minute
- **Product creation**: 10 requests per hour
- **File upload**: 20 requests per hour
- **General API**: 100 requests per minute

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🛠️ SDK Examples

### JavaScript/TypeScript
```javascript
// Initialize client
const client = new SBTCMarketplaceAPI({
  baseURL: 'https://your-domain.com/api',
  sessionToken: 'your-session-token'
})

// Create payment
const payment = await client.payments.create({
  productId: 'prod_123',
  quantity: 1,
  email: 'buyer@example.com'
})

// List products
const products = await client.products.list({
  category: 'ui-kits',
  limit: 20
})
```

### Python
```python
import requests

# Create payment
response = requests.post(
    'https://your-domain.com/api/payments/create',
    headers={'Cookie': 'next-auth.session-token=your-token'},
    json={
        'productId': 'prod_123',
        'quantity': 1,
        'email': 'buyer@example.com'
    }
)
payment = response.json()
```

### cURL
```bash
# Create payment
curl -X POST https://your-domain.com/api/payments/create \
  -H "Cookie: next-auth.session-token=your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "quantity": 1,
    "email": "buyer@example.com"
  }'
```

---

## 📞 Support

For API support:
- **Documentation**: This guide
- **Issues**: GitHub repository
- **Discord**: Community support
- **Email**: api-support@sbtc-marketplace.com

**API Version**: v1  
**Last Updated**: 2024-01-01