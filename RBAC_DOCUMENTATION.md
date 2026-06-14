# Freshko Role-Based Access Control (RBAC) Documentation

## Overview

Freshko uses a comprehensive Role-Based Access Control (RBAC) system with 10 roles and 40+ permissions. This system has replaced the old hardcoded admin login (which used `SELLER_EMAIL` and `SELLER_PASSWORD` environment variables).

## Authentication Flow

### 1. Login Endpoint
**POST** `/api/seller/login`
```json
{
  "email": "admin@freshko.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged In!",
  "user": {
    "email": "admin@freshko.com",
    "name": "Admin User",
    "roles": ["super_admin"]
  }
}
```

### 2. Check Auth Status
**GET** `/api/seller/is-auth`
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@freshko.com",
    "roles": ["super_admin"],
    "permissions": ["all"]
  }
}
```

### 3. Logout
**GET** `/api/seller/logout`

## Roles

### 1. SUPER_ADMIN
**Description:** Full system access. Can do everything.
**Permissions:** `all` (all permissions)
**Use Case:** Business owner, CTO

### 2. ADMIN
**Description:** Full system access except super admin settings.
**Permissions:** `all` (all permissions)
**Use Case:** Operations manager

### 3. SELLER
**Description:** Full shop management. Can manage products, orders, riders, and view analytics.
**Permissions:**
- `products.view`, `products.create`, `products.edit`, `products.delete`
- `orders.view`, `orders.edit`, `orders.assign`
- `categories.view`, `categories.create`, `categories.edit`, `categories.delete`
- `riders.view`, `riders.create`, `riders.edit`, `riders.delete`
- `delivery.view`, `delivery.update`
- `financial.view`
- `support.view`, `support.reply`, `support.resolve`
- `content.view`, `content.edit`
- `settings.view`, `settings.edit`
- `analytics.view`
**Use Case:** Shop owner

### 4. SHOP_MANAGER
**Description:** Manage shop operations but cannot manage riders or categories.
**Permissions:**
- `products.view`, `products.create`, `products.edit`, `products.delete`
- `orders.view`, `orders.edit`
- `categories.view`
- `delivery.view`
- `financial.view`
- `analytics.view`
**Use Case:** Store manager

### 5. SHOP_PICKER
**Description:** Can view products and update order status.
**Permissions:**
- `products.view`
- `orders.view`, `orders.edit`
- `delivery.view`
**Use Case:** Warehouse staff, order picker

### 6. SUPPORT_AGENT
**Description:** Handle customer support and view orders.
**Permissions:**
- `users.view`
- `orders.view`
- `support.view`, `support.reply`, `support.resolve`
**Use Case:** Customer support agent

### 7. CONTENT_MANAGER
**Description:** Manage categories and content.
**Permissions:**
- `content.view`, `content.edit`
- `categories.view`, `categories.create`, `categories.edit`, `categories.delete`
**Use Case:** Marketing/content team

### 8. FINANCE_MANAGER
**Description:** Manage financial operations and view analytics.
**Permissions:**
- `orders.view`
- `financial.view`, `financial.payout`
- `analytics.view`
**Use Case:** Finance/accounts team

### 9. RIDER
**Description:** View and update delivery status.
**Permissions:**
- `delivery.view`, `delivery.update`
**Use Case:** Delivery rider

### 10. CUSTOMER
**Description:** View their own orders.
**Permissions:**
- `orders.view` (only their own orders)
**Use Case:** End customer

## Permissions

### User Management
| Permission | Description | Assigned Roles |
|---|---|---|
| `users.view` | View user list | SUPER_ADMIN, ADMIN, SUPPORT_AGENT |
| `users.create` | Create users | SUPER_ADMIN, ADMIN |
| `users.edit` | Edit users | SUPER_ADMIN, ADMIN |
| `users.delete` | Delete users | SUPER_ADMIN, ADMIN |

### Product Management
| Permission | Description | Assigned Roles |
|---|---|---|
| `products.view` | View products | All except CUSTOMER |
| `products.create` | Create products | SUPER_ADMIN, ADMIN, SELLER, SHOP_MANAGER |
| `products.edit` | Edit products | SUPER_ADMIN, ADMIN, SELLER, SHOP_MANAGER |
| `products.delete` | Delete products | SUPER_ADMIN, ADMIN, SELLER, SHOP_MANAGER |

### Order Management
| Permission | Description | Assigned Roles |
|---|---|---|
| `orders.view` | View orders | All roles |
| `orders.edit` | Edit orders | SUPER_ADMIN, ADMIN, SELLER, SHOP_MANAGER, SHOP_PICKER |
| `orders.cancel` | Cancel orders | SUPER_ADMIN, ADMIN, SELLER |
| `orders.assign` | Assign orders to riders | SUPER_ADMIN, ADMIN, SELLER |

### Category Management
| Permission | Description | Assigned Roles |
|---|---|---|
| `categories.view` | View categories | SUPER_ADMIN, ADMIN, SELLER, SHOP_MANAGER, CONTENT_MANAGER |
| `categories.create` | Create categories | SUPER_ADMIN, ADMIN, SELLER, CONTENT_MANAGER |
| `categories.edit` | Edit categories | SUPER_ADMIN, ADMIN, SELLER, CONTENT_MANAGER |
| `categories.delete` | Delete categories | SUPER_ADMIN, ADMIN, SELLER, CONTENT_MANAGER |

### Rider Management
| Permission | Description | Assigned Roles |
|---|---|---|
| `riders.view` | View riders | SUPER_ADMIN, ADMIN, SELLER |
| `riders.create` | Create riders | SUPER_ADMIN, ADMIN, SELLER |
| `riders.edit` | Edit riders | SUPER_ADMIN, ADMIN, SELLER |
| `riders.delete` | Delete riders | SUPER_ADMIN, ADMIN, SELLER |

### Delivery Management
| Permission | Description | Assigned Roles |
|---|---|---|
| `delivery.view` | View deliveries | SUPER_ADMIN, ADMIN, SELLER, SHOP_MANAGER, SHOP_PICKER, RIDER |
| `delivery.update` | Update delivery status | SUPER_ADMIN, ADMIN, SELLER, RIDER |

### Financial
| Permission | Description | Assigned Roles |
|---|---|---|
| `financial.view` | View financial data | SUPER_ADMIN, ADMIN, SELLER, SHOP_MANAGER, FINANCE_MANAGER |
| `financial.payout` | Process payouts | SUPER_ADMIN, ADMIN, FINANCE_MANAGER |

### Support
| Permission | Description | Assigned Roles |
|---|---|---|
| `support.view` | View support tickets | SUPER_ADMIN, ADMIN, SELLER, SUPPORT_AGENT |
| `support.reply` | Reply to tickets | SUPER_ADMIN, ADMIN, SELLER, SUPPORT_AGENT |
| `support.resolve` | Resolve tickets | SUPER_ADMIN, ADMIN, SELLER, SUPPORT_AGENT |

### Content
| Permission | Description | Assigned Roles |
|---|---|---|
| `content.view` | View content | SUPER_ADMIN, ADMIN, SELLER, CONTENT_MANAGER |
| `content.edit` | Edit content | SUPER_ADMIN, ADMIN, SELLER, CONTENT_MANAGER |

### Settings
| Permission | Description | Assigned Roles |
|---|---|---|
| `settings.view` | View settings | SUPER_ADMIN, ADMIN, SELLER |
| `settings.edit` | Edit settings | SUPER_ADMIN, ADMIN, SELLER |

### Analytics
| Permission | Description | Assigned Roles |
|---|---|---|
| `analytics.view` | View analytics | SUPER_ADMIN, ADMIN, SELLER, SHOP_MANAGER, FINANCE_MANAGER |

## How to Create an Admin User

### Method 1: Using API (Create User with Admin Role)

You need to create a user with the appropriate role. Here's an example:

```javascript
// POST /api/user/register
{
  "name": "Admin User",
  "email": "admin@freshko.com",
  "password": "SecurePassword123!",
  "roles": ["super_admin"]
}
```

**Note:** The role assignment might require an existing super_admin to set it. The system can be configured to allow self-registration with admin roles or require admin approval.

### Method 2: Direct Database Insert

```javascript
// MongoDB shell or script
const bcrypt = require('bcrypt');
const password = await bcrypt.hash('SecurePassword123!', 10);

db.users.insertOne({
  name: "Admin User",
  email: "admin@freshko.com",
  password: password,
  roles: ["super_admin"],
  permissions: ["all"],
  isActive: true,
  createdAt: new Date()
});
```

### Method 3: Create a Seed Script

Create a script `server/scripts/createAdmin.js`:

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const password = await bcrypt.hash('admin123', 10);
  
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@freshko.com',
    password: password,
    roles: ['super_admin'],
    permissions: ['all'],
    isActive: true,
    phone: '+8801XXXXXXXXX'
  });
  
  console.log('Admin created:', admin.email);
  process.exit(0);
};

createAdmin();
```

Run: `node scripts/createAdmin.js`

## How to Assign/Update Roles

### Admin can update user roles:

```javascript
// PUT /api/user/update-role
{
  "userId": "...",
  "roles": ["seller", "shop_manager"]
}
```

### Admin can update user permissions:

```javascript
// PUT /api/user/update-permissions
{
  "userId": "...",
  "permissions": ["products.view", "orders.edit"]
}
```

## Middleware Usage

### Check Authentication
```javascript
import { authMiddleware, authSeller } from './middlewares/auth.js';

// General auth (any logged in user)
router.get('/profile', authMiddleware, getProfile);

// Seller/Admin auth (only admin roles)
router.get('/admin-data', authSeller, getAdminData);
```

### Check Permission
```javascript
import { requirePermission, requireAnyPermission } from './middlewares/auth.js';

// Require specific permission
router.post('/products', requirePermission('products.create'), createProduct);

// Require any of multiple permissions
router.get('/orders', requireAnyPermission('orders.view', 'delivery.view'), getOrders);

// Check permission in controller
import { hasPermission } from './middlewares/auth.js';

const getUser = async (req, res) => {
  if (!hasPermission(req.user, 'users.view')) {
    return res.status(403).json({ success: false, message: 'Permission denied' });
  }
  // ... continue
};
```

## Portal Routes

### Customer Portal
**Route Group:** `(main)`
**URL:** `/`
**Access:** Anyone can browse, but checkout requires login

### Admin/Seller Portal
**Route Group:** `seller`
**URL:** `/seller`
**Access:** Requires admin/seller role
**Login Page:** `/seller/login`

### Rider Portal
**Route Group:** `delivery-man`
**URL:** `/delivery-man`
**Access:** Requires rider role
**Login Page:** `/delivery-man/login`

## User Model Schema

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  roles: [{ type: String, enum: ['super_admin', 'admin', 'seller', 'shop_manager', 'shop_picker', 'support_agent', 'content_manager', 'finance_manager', 'rider', 'customer'] }],
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  // ... other fields
});
```

## Security Notes

1. **Never hardcode credentials** - Always use the database-based RBAC system
2. **Use HTTPS** - All auth endpoints must use HTTPS in production
3. **Secure cookies** - Use `httpOnly`, `secure`, and `sameSite` flags
4. **Password hashing** - All passwords are bcrypt hashed (10 rounds)
5. **Token expiry** - Admin tokens expire after 7 days
6. **Rate limiting** - Login endpoints have rate limiting applied

## Migration from Old System

The old system used:
```env
SELLER_EMAIL=admin@freshko.com
SELLER_PASSWORD=admin123
```

**New system:**
1. Create an admin user in the database (see "How to Create an Admin User" above)
2. Remove `SELLER_EMAIL` and `SELLER_PASSWORD` from `.env`
3. Admin now logs in with email/password stored in the database

## Quick Start

1. **Create first admin:**
   ```bash
   node server/scripts/createAdmin.js
   ```

2. **Login as admin:**
   ```bash
   curl -X POST http://localhost:3000/api/seller/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@freshko.com", "password": "admin123"}'
   ```

3. **Create more users:**
   - Use the admin portal to add users
   - Or use the API endpoint

4. **Assign roles:**
   - Admin can assign roles to users through the admin portal
   - Or use the API endpoint

## Troubleshooting

### "Not Authorized - Admin access only!"
- The user exists but doesn't have an admin role
- Solution: Add `super_admin` or `admin` role to the user

### "Invalid Credentials!"
- Wrong email or password
- Solution: Reset password or create a new admin user

### "Account is deactivated!"
- User's `isActive` field is `false`
- Solution: Update `isActive` to `true` in the database

### "Permission denied"
- User has the role but not the specific permission
- Solution: Add the required permission to the user or update role permissions

## API Reference

### Authentication Endpoints

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/seller/login` | POST | No | Admin login |
| `/api/seller/is-auth` | GET | Yes | Check auth status |
| `/api/seller/logout` | GET | Yes | Logout |

### User Management Endpoints

| Endpoint | Method | Permission Required | Description |
|---|---|---|---|
| `/api/seller/users` | GET | `users.view` | List all users |
| `/api/user/register` | POST | No | Register new user |
| `/api/user/login` | POST | No | Customer login |
| `/api/user/update-role` | PUT | `users.edit` | Update user roles |
| `/api/user/update-permissions` | PUT | `users.edit` | Update user permissions |

## Support

For questions about RBAC, contact the technical team or refer to:
- `/server/middlewares/auth.js` - Core RBAC logic
- `/server/models/User.js` - User model
- `/server/routes/sellerRoute.js` - Admin routes
- `/server/routes/userRoute.js` - User routes
