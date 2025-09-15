text
# SaaS Notes App - Multi-Tenant Architecture

## Overview

This is a multi-tenant SaaS Notes application built with Next.js, TypeScript, and MongoDB, supporting isolated tenant environments with subscription-based access control.

## Multi-Tenancy Implementation

### Architecture Approach: **Shared Database, Shared Schema with Tenant ID**

We have implemented the **Shared Database, Shared Schema** pattern with tenant isolation through a `tenantId` field. This approach was chosen for the following reasons:

#### Why This Approach:

✅ **Cost-Effective**: Single database to manage, backup, and monitor  
✅ **Simple Maintenance**: Schema changes apply uniformly across all tenants  
✅ **Resource Efficiency**: Optimal resource utilization with shared infrastructure  
✅ **Scalability**: Suitable for growing number of tenants with similar requirements  
✅ **Quick Development**: Faster initial development and deployment  

### Tenant Isolation Strategy

#### 1. **Database Schema Design**
All collections include a `tenantId` field for data isolation:

**Users Collection:**
{
_id: ObjectId,
email: String,
password: String,
role: String, // 'admin' | 'member'
tenantId: ObjectId, // Reference to tenant
createdAt: Date
}

text

**Tenants Collection:**
{
_id: ObjectId,
name: String, // "Acme Corporation", "Globex Corporation"
slug: String, // "acme", "globex"
plan: String, // "free" | "pro"
noteLimit: Number, // 3 for free, -1 for unlimited
createdAt: Date
}

text

**Notes Collection:**
{
_id: ObjectId,
title: String,
content: String,
userId: ObjectId,
tenantId: ObjectId, // Ensures tenant isolation
createdAt: Date,
updatedAt: Date
}

text

#### 2. **Data Access Control**
- **Authentication Middleware**: Validates JWT tokens and extracts tenant context
- **Query Filtering**: All database queries automatically include `tenantId` filter
- **API Route Protection**: Ensures users can only access their tenant's data

**Example: Notes API with tenant isolation**
const notes = await db.collection('notes').find({
tenantId: new ObjectId(user.tenantId) // Automatic tenant filtering
}).toArray();

text

#### 3. **Supported Tenants**

The application currently supports these tenants:

| Tenant | Slug | Default Plan | Admin Email | Member Email |
|--------|------|--------------|-------------|--------------|
| **Acme Corporation** | `acme` | Free (3 notes) | `admin@acme.test` | `user@acme.test` |
| **Globex Corporation** | `globex` | Pro (Unlimited) | `admin@globex.test` | `user@globex.test` |

**Default Password**: `password` for all test accounts

### Security & Isolation Guarantees

#### ✅ **Strict Data Isolation**
- **Database Level**: All queries include `tenantId` filtering
- **API Level**: Middleware validates tenant access before data operations
- **UI Level**: Users only see their tenant's data and settings

#### ✅ **Cross-Tenant Access Prevention**
- JWT tokens include tenant context
- User authentication tied to specific tenant
- No cross-tenant data leakage possible through API endpoints

#### ✅ **Role-Based Access Control**
- **Admin**: Can manage subscription, invite users, access admin panel
- **Member**: Can create/edit/delete their own notes, view shared notes

### Subscription Management

#### **Plan Types**
- **Free Plan**: 3 notes limit, basic features
- **Pro Plan**: Unlimited notes, advanced features

#### **Tenant Isolation in Subscriptions**
- Each tenant has independent subscription status
- Plan upgrades/downgrades affect only the specific tenant
- Note limits enforced per tenant, not globally

### API Endpoints & Tenant Context

All API routes maintain tenant isolation:

// Authentication & Tenant Resolution
GET /api/auth/login - Returns tenant-specific JWT
POST /api/auth/register - Creates user within tenant context

// Tenant-Isolated Data Operations
GET /api/notes - Returns notes for authenticated user's tenant only
POST /api/notes - Creates note within user's tenant
PUT /api/notes/[id] - Updates note (tenant ownership verified)
DELETE /api/notes/[id] - Deletes note (tenant ownership verified)

// Tenant Management (Admin Only)
POST /api/tenants/[slug]/upgrade - Upgrades tenant subscription
POST /api/tenants/[slug]/downgrade - Downgrades tenant subscription
POST /api/tenants/[slug]/invite - Invites user to specific tenant

text

### Testing Multi-Tenancy

#### **Login as Different Tenants**

1. **Acme Corporation (Free Plan)**:
   - Admin: `admin@acme.test` / `password`
   - Member: `user@acme.test` / `password`

2. **Globex Corporation (Pro Plan)**:
   - Admin: `admin@globex.test` / `password`
   - Member: `user@globex.test` / `password`

#### **Verification Steps**
1. Login as `admin@acme.test` → Should see Acme tenant data only
2. Create notes → Should be isolated to Acme tenant
3. Login as `admin@globex.test` → Should see completely different data
4. Cross-tenant access attempts should fail with 403 errors

### Alternative Approaches Considered

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Database-per-Tenant** | Maximum isolation, Independent scaling | High maintenance overhead, Complex migrations | ❌ Rejected - Too complex for current scale |
| **Schema-per-Tenant** | Good isolation, Customization support | Migration complexity, PostgreSQL only | ❌ Rejected - MongoDB doesn't support schemas |
| **Shared Schema + Tenant ID** | Simple, Cost-effective, Easy maintenance | Requires careful query filtering | ✅ **Selected** - Best fit for requirements |

### Monitoring & Maintenance

#### **Tenant Health Monitoring**
- Database queries include tenant metrics
- Per-tenant resource usage tracking
- Subscription status monitoring

#### **Data Backup Strategy**
- Single database backup includes all tenant data
- Tenant-specific restore possible through `tenantId` filtering
- Point-in-time recovery maintains tenant isolation

### Future Scalability

This architecture supports:
- **Horizontal Scaling**: Add read replicas for query performance
- **Vertical Scaling**: Increase database resources as tenant count grows  
- **Migration Path**: Can evolve to separate databases if isolation requirements increase
- **Tenant Limits**: Current design supports hundreds of tenants efficiently

### Development Setup

1. **Environment Variables**:
MONGODB_URI=mongodb://localhost:27017/saas-notes
JWT_SECRET=your-secret-key

text

2. **Seed Data**: Run the app to automatically create test tenants and users

3. **Testing**: Use provided test accounts to verify tenant isolation

---

This multi-tenant architecture ensures **strict data isolation** while maintaining **operational simplicity** and **cost efficiency** for the SaaS Notes application.