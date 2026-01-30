# BakeFlow Automation Tool - Setup & Structure Guide

## 📋 Project Structure Overview

```
pages/automation/
├── Home.tsx              ← Landing page (features, benefits, CTA)
├── Auth.tsx              ← Signup/Login pages for shop owners
├── Dashboard.tsx         ← Main order management interface
└── AutomationApp.tsx     ← Router & state management
```

## 🚀 How It Works

### **1. Home Page (`Home.tsx`)**
- **Purpose**: Convince SME shop owners why they need the tool
- **Sections**:
  - Navigation bar with Sign In / Get Started buttons
  - Hero section with value proposition
  - Pain points section (what shop owners struggle with)
  - Features showcase (6 key features)
  - How it works (3-step setup)
  - Pricing section (Starter/Professional/Enterprise)
  - Call-to-action section
  - Footer

- **User Journey**: New visitors land here → Click "Get Started" → Navigate to Signup

### **2. Auth Pages (`Auth.tsx`)**
- **Purpose**: Secure shop owner onboarding
- **Features**:
  - Single component handling both Signup & Login
  - Signup form collects:
    - Owner Name
    - Shop Name
    - Phone Number
    - Email Address
    - Password (with confirmation)
  - Login form collects:
    - Email Address
    - Password
  - Password visibility toggle
  - Form validation
  - Error/Success messages

- **User Journey**: 
  - Signup → Form validation → Account created → Navigate to Dashboard
  - Login → Verify credentials → Navigate to Dashboard

### **3. Dashboard (`Dashboard.tsx`)**
- **Purpose**: Manage shop orders, track status, view analytics
- **Two-panel layout**:
  
  **Left Panel (Sidebar)**:
  - Welcome message with shop name
  - Real-time stats (Pending, Confirmed, Ready, Revenue)
  - Search bar (by customer name or phone)
  - Filter buttons (by status)
  - Orders list (clickable, with status badges)
  - Logout button

  **Right Panel (Main Area)**:
  - Header with toggle sidebar button and order count
  - Order details (when selected):
    - Customer name & contact
    - Order amount
    - Items list
    - Special notes
    - Status update buttons
  - Empty state when no order is selected

- **Features**:
  - Real-time order filtering by status
  - Search functionality
  - Status badges with color coding
  - Responsive sidebar (can collapse)
  - Status update buttons (Pending → Confirmed → In Progress → Ready → Delivered)
  - Mock data for demonstration

### **4. Main App Router (`AutomationApp.tsx`)**
- **Purpose**: Handle navigation between pages
- **State Management**:
  - `currentPage`: tracks which page is showing
  - `shopOwner`: stores logged-in user data
- **Routes**:
  - `home` → Home page
  - `signup` → Auth page (signup mode)
  - `login` → Auth page (login mode)
  - `dashboard` → Dashboard (only if logged in)

## 🔄 Data Flow

```
Home Page
  ↓
  ├─→ "Get Started" button → Signup
  │
  └─→ "Sign In" button → Login
        ↓
      Auth Page
        ↓
        ├─→ Create account → Dashboard
        │
        └─→ Sign in → Dashboard
              ↓
          Dashboard
            ↓
          ├─→ View orders
          ├─→ Filter/Search
          ├─→ Update status
          └─→ Logout → Home Page
```

## 🎨 Design System

### Colors
- **Primary**: Green (#22c55e, #16a34a)
- **Secondary**: Emerald (#10b981)
- **Status Colors**:
  - Pending: Yellow
  - Confirmed: Blue
  - In Progress: Purple
  - Ready: Green
  - Delivered: Slate

### Components Used
- Lucide React icons (installed via npm)
- Tailwind CSS for styling
- Responsive design (mobile-first)

## 📱 How to Access

### **Development Mode**

1. **Shop (Original)**:
   ```bash
   npm run dev
   # Opens at http://localhost:3001
   ```

2. **Automation Tool**:
   ```bash
   npm run dev
   # Then navigate to: http://localhost:3001/?mode=automation
   ```

### **Production Mode**

- Shop: `https://yourdomain.com`
- Automation Tool: `https://yourdomain.com?mode=automation`

## 🔧 Current Implementation Notes

### **Mock Data**
- Dashboard uses mock order data
- No real database integration yet
- Form submissions simulate API calls with 1.5s delay

### **Authentication**
- Currently simulated (no real backend)
- Form validation works
- Data persists during session

### **Next Steps for Full Implementation**

1. **Backend APIs needed**:
   - POST `/api/auth/signup` - Create shop owner account
   - POST `/api/auth/login` - Authenticate shop owner
   - GET `/api/orders` - Fetch shop's orders
   - PATCH `/api/orders/:id` - Update order status
   - GET `/api/analytics` - Get shop analytics

2. **Database Schema**:
   ```javascript
   // Shop Owners Collection
   {
     _id: ObjectId,
     shopName: String,
     ownerName: String,
     phone: String,
     email: String,
     password: Hash,
     verified: Boolean,
     createdAt: Date
   }

   // Orders Collection
   {
     _id: ObjectId,
     shop_id: ObjectId,  // Link to shop owner
     customerName: String,
     phone: String,
     amount: Number,
     status: String,
     items: Array,
     createdAt: Date,
     notes: String
   }
   ```

3. **Integration Points**:
   - Replace mock data with API calls
   - Add real authentication
   - Connect to MongoDB
   - Add JWT tokens for sessions
   - Add error handling & retry logic

## 📊 Feature Roadmap

### **Phase 1: Foundation** ✅ (Current)
- [x] Home/Landing page
- [x] Signup/Login pages
- [x] Order Dashboard
- [x] Order filtering & search
- [x] Status management

### **Phase 2: Enhancement** (Next)
- [ ] Analytics dashboard (charts & insights)
- [ ] Bulk order operations
- [ ] Customer management (phone book)
- [ ] Auto-response templates
- [ ] Order export/reports
- [ ] Mobile app optimization
- [ ] Notification system

### **Phase 3: Advanced** (Future)
- [ ] AI-powered auto-responses
- [ ] Predictive analytics
- [ ] Integration with payment gateways
- [ ] WhatsApp/SMS notifications
- [ ] Multi-user support (staff management)
- [ ] API for third-party integrations

## ✅ Testing Checklist

### **Home Page**
- [ ] All CTA buttons navigate correctly
- [ ] Pricing cards are readable
- [ ] Mobile layout responsive
- [ ] Images load properly

### **Auth Pages**
- [ ] Signup form validates all fields
- [ ] Login form works
- [ ] Password toggle works
- [ ] Error messages display correctly
- [ ] Success messages appear after submission

### **Dashboard**
- [ ] Orders list displays correctly
- [ ] Filtering by status works
- [ ] Search functionality works
- [ ] Clicking order shows details
- [ ] Status update buttons work
- [ ] Sidebar collapse/expand works
- [ ] Logout button clears session

## 🐛 Known Issues

1. **Data persistence**: All data is lost on page refresh (no real database)
2. **Authentication**: Not real (no backend verification)
3. **Orders**: Using mock data only
4. **Styling**: Tailwind CSS required in project

## 📚 Related Files

- `App.tsx` - Main app with mode switching logic
- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration
- `package.json` - Dependencies (includes lucide-react)
- `tsconfig.json` - TypeScript configuration

## 🎯 Key Metrics to Track

1. **Home Page**: Signup/Login conversion rate
2. **Auth**: Form completion rate, error rate
3. **Dashboard**: Average orders viewed, status update frequency
4. **Retention**: Daily/Monthly active shops

---

**Last Updated**: January 30, 2026
**Status**: Foundation Phase Complete, Ready for Backend Integration
