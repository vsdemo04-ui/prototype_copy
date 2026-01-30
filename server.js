import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/demo_shop';

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(`📡 Connecting to: ${MONGODB_URI}`);

let db;
const mongoClient = new MongoClient(MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Serve automation.html as root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'automation.html'));
});

// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoClient.connect();
    const dbName = MONGODB_URI.split('/').pop() || 'demo_shop';
    db = mongoClient.db(dbName);
    console.log(`✅ Connected to MongoDB database: ${dbName}`);
    
    // Create indexes
    await db.collection('users').createIndex({ phone: 1 });
    await db.collection('orders').createIndex({ customerId: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('chats').createIndex({ orderId: 1 });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

// API status route
app.get('/status', (req, res) => {
  res.json({ 
    message: '🚀 BakeFlow API Server Running',
    status: 'Connected ✅',
    database: 'MongoDB Connected ✅',
    frontend: 'http://localhost:3001',
    endpoints: {
      users: '/api/users',
      orders: '/api/orders',
      chats: '/api/chats',
      dashboard: 'http://localhost:3001/dashboard.html'
    }
  });
});

// ========== USER ROUTES ==========
app.post('/api/users', async (req, res) => {
  try {
    const user = {
      ...req.body,
      createdAt: new Date()
    };
    const result = await db.collection('users').insertOne(user);
    console.log(`✅ User created: ${user.id || user.name} (MongoDB ID: ${result.insertedId})`);
    res.json({ ...user, _id: result.insertedId });
  } catch (err) {
    console.error('❌ User creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/phone/:phone', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ phone: req.params.phone });
    if (user) {
      const { _id, ...rest } = user;
      res.json({ id: _id, ...rest });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ORDER ROUTES ==========
app.post('/api/orders', async (req, res) => {
  try {
    const order = {
      ...req.body,
      createdAt: new Date()
    };
    console.log(`📝 Creating order: ID=${order.id}, Customer=${order.customerId}, Amount=₹${order.totalAmount}, Status=${order.status}`);
    
    const result = await db.collection('orders').insertOne(order);
    console.log(`✅ Order stored in MongoDB: ${result.insertedId}`);
    
    // Add system message
    await db.collection('chats').insertOne({
      orderId: order.id,
      sender: 'SYSTEM',
      text: `New order received from ${order.customerName}. Order total: ₹${order.totalAmount}`,
      timestamp: new Date().toISOString()
    });
    
    res.json({ ...order, _id: result.insertedId });
  } catch (err) {
    console.error('❌ Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`📦 Retrieved ${orders.length} total orders from database`);
    
    const formatted = orders.map(o => ({
      ...o,
      id: o._id,
      _id: undefined
    }));
    res.json(formatted);
  } catch (err) {
    console.error('❌ Orders retrieval error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/customer/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log(`🔍 Fetching orders for customer: ${customerId}`);
    
    const orders = await db.collection('orders')
      .find({ customerId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`📦 Found ${orders.length} orders for customer ${customerId}`);
    
    const formatted = orders.map(o => ({
      ...o,
      id: o._id,
      _id: undefined
    }));
    res.json(formatted);
  } catch (err) {
    console.error('❌ Customer orders retrieval error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;
    
    console.log(`🔄 Updating order: ID=${orderId}, Updates=${JSON.stringify(updates)}`);
    
    // Try to convert to ObjectId if it's a valid MongoDB ID
    let query;
    try {
      query = { _id: new ObjectId(orderId) };
    } catch (e) {
      // If not a valid ObjectId, try to match by id field
      query = { id: orderId };
    }
    
    const result = await db.collection('orders').updateOne(
      query,
      { $set: updates }
    );
    
    console.log(`   Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    if (result.matchedCount === 0) {
      console.log(`❌ Order not found with id: ${orderId}`);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, modifiedCount: result.modifiedCount, matchedCount: result.matchedCount });
  } catch (err) {
    console.error('❌ Order update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== CHAT/MESSAGE ROUTES ==========
app.post('/api/chats', async (req, res) => {
  try {
    const chat = {
      ...req.body,
      timestamp: new Date().toISOString()
    };
    console.log(`💬 Storing chat message: Order=${chat.orderId}, Sender=${chat.sender}, Text=${chat.text.substring(0, 50)}...`);
    
    const result = await db.collection('chats').insertOne(chat);
    console.log(`✅ Chat message stored: ${result.insertedId}`);
    
    res.json({ ...chat, _id: result.insertedId });
  } catch (err) {
    console.error('❌ Chat creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all chats (for dashboard)
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await db.collection('chats')
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    
    console.log(`📖 Retrieved ${chats.length} total chat messages`);
    
    const formatted = chats.map(c => ({
      ...c,
      id: c._id,
      _id: undefined
    }));
    res.json(formatted);
  } catch (err) {
    console.error('❌ Chat retrieval error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get chats for specific order
app.get('/api/chats/:orderId', async (req, res) => {
  try {
    const chats = await db.collection('chats')
      .find({ orderId: req.params.orderId })
      .sort({ timestamp: 1 })
      .toArray();
    
    console.log(`📖 Retrieved ${chats.length} chat messages for order ${req.params.orderId}`);
    
    const formatted = chats.map(c => ({
      ...c,
      id: c._id,
      _id: undefined
    }));
    res.json(formatted);
  } catch (err) {
    console.error('❌ Chat retrieval error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== AUTOMATION TOOL ROUTE (Send WhatsApp Message) ==========
app.post('/api/automation/send-whatsapp', async (req, res) => {
  try {
    const { orderId, message, senderName } = req.body;
    
    console.log(`📱 WhatsApp message request: Order=${orderId}, From=${senderName}`);
    
    // Save message to database
    const chatMessage = {
      orderId,
      sender: 'AGENT',
      text: message,
      timestamp: new Date().toISOString(),
      sentBy: senderName
    };
    
    const result = await db.collection('chats').insertOne(chatMessage);
    console.log(`✅ WhatsApp message saved: ${result.insertedId}`);
    
    // In a real scenario, this would integrate with Twilio/WhatsApp API
    console.log(`   Message text: ${message}`);
    
    res.json({ 
      success: true, 
      message: 'WhatsApp message would be sent (integration needed)',
      savedToDatabase: true,
      dbId: result.insertedId
    });
  } catch (err) {
    console.error('❌ WhatsApp message error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server running', db: db ? 'Connected' : 'Not connected' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BakeFlow Server running on http://localhost:${PORT}`);
    console.log(`📦 Frontend on http://localhost:3001`);
  });
});
