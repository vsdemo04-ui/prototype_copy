# BakeFlow Debugging & Testing Guide

## What Was Fixed

### 1. **Database Connection Issue**
- **Problem**: Server was hardcoded to use `'bakeflow'` database instead of `'demo_shop'`
- **Fix**: Now dynamically extracts database name from MONGODB_URI
- **Impact**: Orders and users will now store in the correct `demo_shop` database

### 2. **PATCH Endpoint Field Mismatch** 
- **Problem**: When updating orders, server queried by MongoDB `_id` field but orders use custom string `id` field
- **Fix**: Changed query from `{ _id: new ObjectId(orderId) }` to `{ id: orderId }`
- **Impact**: Claim button now correctly updates order status in database

### 3. **Double Message Sending**
- **Problem**: Click send once, message appears twice (event handler firing twice)
- **Fix**: Added `sendInProgress` ref to track send state and prevent concurrent sends
- **Impact**: Only one message per send click

### 4. **Enhanced Logging**
- **Added detailed console logs** at every database operation:
  ```
  ✅ User created: john@example.com (MongoDB ID: 507f1f77bcf86cd799439011)
  📝 Creating order: ID=123, Customer=user123, Amount=₹1200, Status=PENDING
  ✅ Order stored in MongoDB: 507f1f77bcf86cd799439012
  🔄 Updating order: ID=123, Updates={"status":"CONFIRMED"}
      Matched: 1, Modified: 1
  💬 Storing chat message: Order=123, Sender=AGENT, Text=Order confirmed...
  📦 Retrieved 5 total orders from database
  📖 Retrieved 3 chat messages for order 123
  ```

## Testing Steps

### Prerequisites
- MongoDB running: `mongod` in separate terminal
- Both servers should be running:
  ```bash
  npm run dev-all
  ```
  Or in two terminals:
  ```bash
  # Terminal 1
  npm run server
  
  # Terminal 2
  npm run dev
  ```

### Test 1: User Sign Up (Database Persistence)
1. Open app at `http://localhost:3001`
2. Click **"Sign in / Sign up"** button
3. Enter:
   - Name: `Test User`
   - Phone: `9876543210`
4. Click **"Continue"**
5. **Expected Result**: User appears in MongoDB Compass
   - Go to Compass → `demo_shop` → `users` collection
   - Should see your user document with name, phone, id, createdAt

**Server Console Should Show**:
```
✅ User created: Test User (MongoDB ID: xxxxx)
```

### Test 2: Create Order (Database Persistence)
1. After signing in, select some bakery items
2. Click **"Checkout"** button
3. Click **"Place Order"** button
4. **Expected Result**: Order appears in MongoDB Compass
   - Go to Compass → `demo_shop` → `orders` collection
   - Should see your order with customerId, totalAmount, status, createdAt, items

**Server Console Should Show**:
```
📝 Creating order: ID=abc123, Customer=user456, Amount=₹1200, Status=PENDING
✅ Order stored in MongoDB: xxxxx
💬 Storing chat message: Order=abc123, Sender=SYSTEM, Text=New order received...
✅ Chat message stored: yyyyy
```

### Test 3: View Profile Orders
1. Click **"My Orders"** tab
2. **Expected Result**: Your order appears in the list
3. Status should be **PENDING**

**Server Console Should Show**:
```
🔍 Fetching orders for customer: user456
📦 Found 1 orders for customer user456
```

### Test 4: Admin Portal - Claim Order
1. Go to **Business Portal** (Admin automation tool)
2. Click on your order from the list
3. Click **"Claim Order"** button
4. **Expected Result**: 
   - Order status changes from "PENDING" to "CONFIRMED"
   - Order moves from "Pending Orders" to "My Orders"

**Server Console Should Show**:
```
🔄 Updating order: ID=abc123, Updates={"status":"CONFIRMED"}
   Matched: 1, Modified: 1
```

**MongoDB Compass Should Show**:
- Order status changed from `PENDING` to `CONFIRMED`

### Test 5: Send WhatsApp Message (No Duplicates)
1. From Business Portal with claimed order
2. Type message: `Order confirmed! Will be ready by 2 PM ✅`
3. Click **"Send"** button **ONCE ONLY** (don't click multiple times)
4. **Expected Result**: Message appears once in chat history below

**Server Console Should Show**:
```
📱 WhatsApp message request: Order=abc123, From=Automation Agent
✅ WhatsApp message saved: zzzzz
   Message text: Order confirmed! Will be ready by 2 PM ✅
💬 Storing chat message: Order=abc123, Sender=AGENT, Text=Order confirmed!...
📖 Retrieved 2 chat messages for order abc123
```

**Chat History Should Show**:
- Only ONE message (not duplicate)
- Your message with timestamp

### Test 6: Rapid Send Test (Double-Send Prevention)
1. Type: `Test message`
2. Press Enter key
3. **Immediately** click "Send" button
4. **Expected Result**: Only one message sent (not two)

### Test 7: View Chat History
1. Admin Portal with selected order
2. Scroll down to **Chat History** section
3. **Expected Result**: 
   - System message (new order notification)
   - Agent messages you sent
   - All with correct sender (SYSTEM/AGENT) and timestamps

**Server Console Should Show**:
```
📖 Retrieved 5 chat messages for order abc123
```

## Troubleshooting

### Data Still Not Persisting
**Check:**
1. MongoDB is running: `mongod` should show connection in terminal
2. .env.local has correct URI: `MONGODB_URI=mongodb://localhost:27017/demo_shop`
3. Database exists: Check Compass for `demo_shop`
4. Collections exist: Check Compass for `users` and `orders`

**If Still Failing:**
- Check server console for **red error logs** (❌)
- Copy full error message
- Check server logs for: "User creation error", "Order creation error", "Order update error"

### Orders Show But Don't Update
**Check:**
1. Order ID in console matches what you see in Compass
2. Server shows "Matched: 1, Modified: 1" when claiming
3. Refresh page to see status change (no auto-update yet)

### Messages Still Sending Twice
**Check:**
1. You're using latest code with `sendInProgress` ref
2. Restart both servers (Ctrl+C and rerun)
3. Clear browser cache (Ctrl+Shift+Delete)

### MongoDB Connection Says "Not Connected"
1. Check health endpoint: `curl http://localhost:5001/health`
2. Start MongoDB: `mongod` in another terminal
3. Check port 27017 is not blocked

## Key Code Changes Made

### server.js
- Line 29: Database name extracted from MONGODB_URI
- Line 46: User creation logging
- Line 79: Order creation logging with status preservation
- Line 107: Orders retrieval logging
- Line 121: Customer orders retrieval logging
- Line 145: PATCH endpoint now queries by `id` field (not `_id`)
- Line 173: Chat creation logging
- Line 205: WhatsApp automation logging

### views/BusinessPortal.tsx
- Line ~20: Added `const sendInProgress = React.useRef(false);`
- Lines 125-160: handleSend function now checks and sets sendInProgress ref

## Expected MongoDB Collections Structure

```
demo_shop
├── users
│   └── {
│       "_id": ObjectId,
│       "id": "user123",
│       "name": "John Doe",
│       "phone": "9876543210",
│       "createdAt": ISODate
│     }
├── orders
│   └── {
│       "_id": ObjectId,
│       "id": "order456",
│       "customerId": "user123",
│       "customerName": "John Doe",
│       "totalAmount": 1200,
│       "status": "CONFIRMED",
│       "items": [...],
│       "createdAt": ISODate
│     }
└── chats
    └── {
        "_id": ObjectId,
        "orderId": "order456",
        "sender": "AGENT",
        "text": "Message content",
        "timestamp": ISODate
      }
```

## Performance Notes

- **Order Polling**: 2-3 second intervals (not real-time)
- **Chat Retrieval**: Loads on order selection
- **Send Delay**: ~500-1000ms (API roundtrip)

For production, consider:
- WebSockets for real-time updates
- Message batching
- Pagination for large order/chat lists
