# Quick Test Commands

## Setup
```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Install dependencies (if not already done)
npm install

# Terminal 3 - Start both servers
npm run dev-all
```

Then open `http://localhost:3001` in your browser.

## Manual API Tests (Using curl or Postman)

### 1. Test User Creation
```bash
curl -X POST http://localhost:5001/api/users \\
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "name": "Test User",
    "phone": "9876543210"
  }'
```
**Expected Response**: 
```json
{
  "id": "user123",
  "name": "Test User",
  "phone": "9876543210",
  "_id": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```
**Console Output**: `✅ User created: Test User (MongoDB ID: 507f1f77bcf86cd799439011)`

---

### 2. Test Get User by Phone
```bash
curl http://localhost:5001/api/users/phone/9876543210
```
**Expected Response**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Test User",
  "phone": "9876543210",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. Test Create Order
```bash
curl -X POST http://localhost:5001/api/orders \
  -H "Content-Type: application/json" \\
  -d '{
    "id": "order123",
    "customerId": "user123",
    "customerName": "Test User",
    "totalAmount": 1500,
    "status": "PENDING",
    "items": [
      {"name": "Chocolate Cake", "quantity": 2, "price": 750}
    ]
  }'
```
**Expected Response**: 
```json
{
  "id": "order123",
  "customerId": "user123",
  "customerName": "Test User",
  "totalAmount": 1500,
  "status": "PENDING",
  "items": [...],
  "_id": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-15T10:31:00.000Z"
}
```
**Console Output**:
```
📝 Creating order: ID=order123, Customer=user123, Amount=₹1500, Status=PENDING
✅ Order stored in MongoDB: 507f1f77bcf86cd799439012
💬 Storing chat message: Order=order123, Sender=SYSTEM, Text=New order received...
✅ Chat message stored: 507f1f77bcf86cd799439013
```

---

### 4. Test Get All Orders
```bash
curl http://localhost:5001/api/orders
```
**Console Output**: `📦 Retrieved 1 total orders from database`

---

### 5. Test Get Customer Orders
```bash
curl http://localhost:5001/api/orders/customer/user123
```
**Console Output**: `🔍 Fetching orders for customer: user123`  
`📦 Found 1 orders for customer user123`

---

### 6. Test Update Order Status (THE CRITICAL FIX)
```bash
curl -X PATCH http://localhost:5001/api/orders/order123 \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'
```
**Expected Response**:
```json
{
  "success": true,
  "modifiedCount": 1,
  "matchedCount": 1
}
```
**Console Output**:
```
🔄 Updating order: ID=order123, Updates={"status":"CONFIRMED"}
   Matched: 1, Modified: 1
```

**If it fails with "Order not found"**:
```
🔄 Updating order: ID=order123, Updates={"status":"CONFIRMED"}
   Matched: 0, Modified: 0
❌ Order not found with id: order123
```
This would indicate the PATCH fix didn't work - check that orderId format matches what's in database.

---

### 7. Test Add Chat Message
```bash
curl -X POST http://localhost:5001/api/chats \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order123",
    "sender": "AGENT",
    "text": "Your order is being prepared!"
  }'
```
**Console Output**: 
```
💬 Storing chat message: Order=order123, Sender=AGENT, Text=Your order is being prepared!
✅ Chat message stored: 507f1f77bcf86cd799439014
```

---

### 8. Test Get Chat Messages
```bash
curl http://localhost:5001/api/chats/order123
```
**Console Output**: `📖 Retrieved 2 chat messages for order order123`

---

### 9. Test WhatsApp Automation Endpoint
```bash
curl -X POST http://localhost:5001/api/automation/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order123",
    "message": "Your order is ready for pickup!",
    "senderName": "Automation Agent"
  }'
```
**Expected Response**:
```json
{
  "success": true,
  "message": "WhatsApp message would be sent (integration needed)",
  "savedToDatabase": true,
  "dbId": "507f1f77bcf86cd799439015"
}
```
**Console Output**:
```
📱 WhatsApp message request: Order=order123, From=Automation Agent
✅ WhatsApp message saved: 507f1f77bcf86cd799439015
   Message text: Your order is ready for pickup!
```

---

### 10. Test Health Check
```bash
curl http://localhost:5001/health
```
**Expected Response**:
```json
{
  "status": "Server running",
  "db": "Connected"
}
```

---

## Browser Testing Flow

### Complete User Journey
1. **Sign Up**
   - Click "Sign in / Sign up"
   - Enter Name: `John Doe`
   - Enter Phone: `9876543210`
   - Click "Continue"
   - **Check MongoDB**: User should appear in `demo_shop.users`

2. **Browse Products**
   - Select items from the storefront
   - Click "Add to Cart"

3. **Checkout**
   - Click "Checkout"
   - Enter phone and review
   - Click "Place Order"
   - **Check MongoDB**: Order should appear in `demo_shop.orders` with status `PENDING`

4. **View Profile Orders**
   - Click "My Orders" tab
   - **Should see**: Your order with PENDING status

5. **Admin Portal**
   - Click "Business Portal"
   - **Should see**: Your order in "Pending Orders"
   - Click order to select it
   - **Should see**: Order details and chat history

6. **Claim Order**
   - Click "Claim Order" button
   - **Check MongoDB**: Order status should change to `CONFIRMED`
   - Order should move to "My Orders" section

7. **Send Message**
   - Type: `Order confirmed! Will be ready by 2 PM`
   - Press Enter OR click "Send"
   - **Should see**: One message appear (not duplicate)
   - **Check MongoDB**: Message should appear in `demo_shop.chats`

8. **Test Double-Send Prevention**
   - Type: `Quick test`
   - Rapidly press Enter key multiple times
   - **Should see**: Only one message appears
   - **Should see**: No error messages

---

## MongoDB Compass Verification

After each step, check MongoDB Compass:
- Address: `mongodb://localhost:27017`
- Database: `demo_shop`
- Collections: `users`, `orders`, `chats`

### Users Collection Check
```json
{
  "_id": ObjectId("507f..."),
  "id": "user123",
  "name": "John Doe",
  "phone": "9876543210",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

### Orders Collection Check
```json
{
  "_id": ObjectId("507f..."),
  "id": "order123",
  "customerId": "user123",
  "customerName": "John Doe",
  "totalAmount": 1500,
  "status": "CONFIRMED",  // Should change after claim
  "items": [...],
  "createdAt": ISODate("2024-01-15T10:31:00.000Z")
}
```

### Chats Collection Check
```json
{
  "_id": ObjectId("507f..."),
  "orderId": "order123",
  "sender": "SYSTEM",     // or "AGENT"
  "text": "Message content",
  "timestamp": ISODate("2024-01-15T10:32:00.000Z")
}
```

---

## Troubleshooting Commands

### Check if MongoDB is running
```bash
netstat -ano | findstr :27017
```
Should show a LISTENING connection.

### Check if backend is running
```bash
netstat -ano | findstr :5000
```
Should show a LISTENING connection.

### Check if frontend is running
```bash
netstat -ano | findstr :3000
```
Should show a LISTENING connection.

### Kill ports if stuck
```bash
# Find process on port 5000
netstat -ano | findstr :5000
# Kill it (replace PID)
taskkill /PID <PID> /F

# Same for 3000 and 27017
```

### View recent MongoDB logs
```bash
# MongoDB should show in its terminal window
# Look for "Waiting for connections"
```

### View Backend Server Logs
```bash
# Terminal running "npm run server" should show:
# - Connection messages
# - Request logs (✅, 📝, 🔄, etc)
# - Error messages (❌)
```

### View Frontend Errors
```bash
# Open browser DevTools: F12 or Right-click → Inspect
# Go to Console tab
# Look for red error messages
# Check Network tab for failed API calls (4xx, 5xx responses)
```

---

## Expected Timeline

- **Sign up**: 1-2 seconds
- **Place order**: 2-3 seconds
- **Load profile orders**: 1-2 seconds
- **Claim order**: 1-2 seconds
- **Send message**: 1-2 seconds

If any action takes >5 seconds, there's likely a connection issue.
