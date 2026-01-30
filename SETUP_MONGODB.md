# BakeFlow - MongoDB Integration Complete! 🎉

## Architecture Overview

This is now a **full-stack application** with MongoDB backend:

```
Customer (Storefront) 
    ↓ [Orders API POST]
Backend (Node.js Express + MongoDB)
    ↓ [Real-time polling]
Automation Tool (BusinessPortal)
    ↓ [WhatsApp Message Templates]
Customer [WhatsApp Notification]
```

## Project Structure

```
📦 bakeflow/
├── server.js                 # Express.js backend with MongoDB
├── .env.local               # MongoDB connection string
├── package.json             # Backend + Frontend dependencies
├── vite.config.ts           # Frontend build config
│
├── 📁 services/
│   └── store.ts            # API service layer (calls backend)
│
├── 📁 views/
│   ├── Storefront.tsx      # Customer ordering interface
│   ├── BusinessPortal.tsx  # Admin/Automation tool dashboard
│   └── AdminDashboard.tsx
│
├── 📁 components/
│   ├── AuthModal.tsx       # Login/Signup
│   └── Navbar.tsx
│
└── App.tsx                 # Main app routing
```

## Setup Instructions

### 1. Get MongoDB Atlas Connection String

```bash
# Go to: https://www.mongodb.com/cloud/atlas
# Create a FREE cluster
# Get your connection string:
# mongodb+srv://username:password@cluster.mongodb.net/bakeflow?retryWrites=true&w=majority
```

### 2. Update `.env.local`

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/bakeflow?retryWrites=true&w=majority
```

### 3. Install Dependencies

```powershell
cd 'd:\New folder\bakeflow_-integrated-shop-&-crm-prototype'
npm install
```

### 4. Start Backend Server (Terminal 1)

```powershell
node server.js
```

You should see:
```
✅ Connected to MongoDB
🚀 BakeFlow Server running on http://localhost:5001
```

### 5. Start Frontend Dev Server (Terminal 2)

```powershell
npm run dev
```

Open: http://localhost:3001

## How It Works

### 1. Customer Orders (Storefront)
- Customer logs in
- Adds items to cart
- Clicks "Checkout"
- **Frontend sends POST to backend:** `POST /api/orders`
- Order saved in **MongoDB**

### 2. Automation Tool Receives Order (BusinessPortal)
- Admin portal polls: `GET /api/orders`
- Every 2 seconds, fetches new orders from MongoDB
- Shows pending orders in left sidebar

### 3. Agent Claims & Responds
- Agent clicks "Claim Order"
- Selects template: ✅ Confirm, 🔄 In Progress, 🚚 Out for Delivery, ✨ Completed
- Sends message: `POST /api/automation/send-whatsapp`
- Message saved in **MongoDB Chats collection**

### 4. Real-time Updates
- Both frontend and admin portal poll `/api/orders` & `/api/chats`
- Orders update in real-time as agent responds

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users/phone/:phone` - Get user by phone

### Orders  
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/customer/:id` - Get customer's orders
- `PATCH /api/orders/:id` - Update order status

### Chats
- `POST /api/chats` - Add message
- `GET /api/chats/:orderId` - Get messages for order

### Automation
- `POST /api/automation/send-whatsapp` - Send WhatsApp message

## MongoDB Collections

The system auto-creates these in your MongoDB database:

```javascript
// Users Collection
{ _id, name, email, phone, role, createdAt }

// Orders Collection
{ _id, id, customerId, customerName, customerPhone, items, totalAmount, status, createdAt, claimedBy }

// Chats Collection
{ _id, orderId, sender, text, timestamp }
```

## Features Implemented

✅ **Frontend** - React + Vite + TypeScript
✅ **Backend** - Node.js + Express
✅ **Database** - MongoDB Atlas
✅ **Real-time** - Order polling every 2 seconds
✅ **Automation Tool** - Admin portal with templates
✅ **No API keys needed** - No Google GenAI dependency
✅ **WhatsApp Ready** - Message templates for Twilio integration

## Next Steps (Optional)

1. **Twilio WhatsApp Integration:**
   - Replace `/api/automation/send-whatsapp` with actual Twilio API
   - Send real WhatsApp messages to customers

2. **Advanced Features:**
   - Order notifications/email
   - Analytics dashboard
   - Bulk order import

3. **Deployment:**
   - Backend: Heroku, Railway, Vercel
   - Frontend: Vercel, Netlify
   - MongoDB: MongoDB Atlas (already cloud-based)

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
→ Check MONGODB_URI in `.env.local`
→ Make sure MongoDB Atlas cluster is active
→ Whitelist your IP in MongoDB Atlas

### Frontend not connecting to backend
```
Error: fetch failed http://localhost:5001
```
→ Make sure server.js is running on port 5000
→ Check `services/store.ts` has correct API_BASE URL

### CORS Error
→ Already handled in server.js with cors() middleware

---

**Questions?** All code is structured for easy expansion. The backend is ready for Twilio/WhatsApp API integration! 🚀
