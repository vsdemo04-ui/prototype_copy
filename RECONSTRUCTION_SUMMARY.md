# ✅ BAKEFLOW - COMPLETE RECONSTRUCTION

## What Changed

### ❌ REMOVED:
- Google Gemini AI API (no key needed anymore)
- localStorage (single user, no persistence)
- Clone code (was tightly coupled to localStorage)

### ✅ ADDED:
- **Express.js Backend** (`server.js`)
- **MongoDB Integration** (real database)
- **API Layer** (`services/store.ts`)
- **Real-time Order Polling** (2-second refresh)
- **WhatsApp Message Templates** (no AI, just templates)
- **Automation Tool Interface** (like Wati/Respond.io)

---

## How to Run

### Terminal 1: Backend Server
```powershell
cd 'd:\New folder\bakeflow_-integrated-shop-&-crm-prototype'
node server.js
```

### Terminal 2: Frontend Dev Server
```powershell
npm run dev
```

### In Browser:
- **Frontend (Customer):** http://localhost:3001
- **Admin Portal:** http://localhost:3001/#/business
- **Backend API:** http://localhost:5001

---

## Setup MongoDB (IMPORTANT)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create FREE account & cluster
3. Copy connection string
4. Paste in `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bakeflow?retryWrites=true&w=majority
```

---

## How It Works (Like RedBus)

```
1. CUSTOMER BOOKS (Storefront)
   └─ Clicks "Checkout" 
      └─ Order sent to backend
         └─ Saved in MongoDB

2. AGENT SEES ORDER (BusinessPortal)
   └─ Polls /api/orders every 2 seconds
      └─ Shows pending orders
         └─ Agent selects template

3. AGENT SENDS MESSAGE
   └─ Clicks "Confirm" button
      └─ Message saved to MongoDB
         └─ Customer would get WhatsApp (integrate Twilio)

4. REAL-TIME UPDATE
   └─ All interfaces sync via MongoDB
      └─ No API key needed
         └─ Data persists
```

---

## File Structure

```
server.js                 ← Backend (Express + MongoDB)
.env.local               ← MongoDB connection
package.json             ← All dependencies
services/store.ts        ← API calls to backend (replaces localStorage)
views/BusinessPortal.tsx ← Admin automation tool (Wati-like)
views/Storefront.tsx     ← Customer ordering interface
```

---

## Key Features

✅ **Scalable** - MongoDB Atlas scales automatically  
✅ **Real-time** - Order polling every 2 seconds  
✅ **No API Keys** - No Gemini/OpenAI needed  
✅ **WhatsApp Ready** - Template system for messages  
✅ **Production Ready** - Express + MongoDB best practices  

---

## Database Collections

Automatically created in MongoDB:

```javascript
users       // { phone, name, email, role }
orders      // { customerId, items, status, totalAmount }
chats       // { orderId, sender, text, timestamp }
```

---

## Next: WhatsApp Integration (Optional)

To send REAL WhatsApp messages:

1. Get Twilio account: https://www.twilio.com
2. Update `server.js` `/api/automation/send-whatsapp` endpoint
3. Replace console.log with actual Twilio API call

Currently: Messages saved to MongoDB (mock)
After Twilio: Messages sent to customer WhatsApp

---

## Ready to Go! 🚀

Everything is set up. Just add your MongoDB connection string to `.env.local` and run both servers!
