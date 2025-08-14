# Product Requirements Document: Multi-User Personal Finance Management (MVP)

## 1. Executive Summary

### Vision Statement
Enable couples and families to seamlessly collaborate on personal finance management through secure account sharing with unified financial oversight.

### Business Objective
Transform the personal finance app from single-user to multi-user, targeting couples and families who want to manage their finances together.

### Success Metrics
- **User Engagement**: 40% increase in daily active users within shared accounts
- **Retention**: 60% improvement in 6-month retention for accounts with multiple users
- **Feature Adoption**: 80% of invited users actively contribute transactions within 30 days

---

## 2. Problem Statement

### Current Pain Points
1. **Separate Financial Silos**: Couples manage finances in isolation, leading to miscommunication
2. **Manual Reconciliation**: Partners manually share transaction information through text/email
3. **Incomplete Financial Picture**: Neither partner has full visibility into household spending
4. **Duplicate Efforts**: Both partners track shared expenses separately

### Target User Personas
- **Primary Users**: Couples (married/partnered) aged 25-45 with shared financial goals
- **Secondary Users**: Families with teenage children learning financial responsibility

---

## 3. MVP Solution Overview

### Core Value Proposition
"Invite your partner to manage finances together - see shared spending in real-time with complete transparency."

### MVP Features (No Permission Levels)
1. **Simple Account Sharing & Invitations**
2. **Individual Transaction Ownership**
3. **Unified Financial Dashboard**
4. **Basic User Attribution**

---

## 4. MVP Feature Specifications

### 4.1 Account Sharing & Invitations

#### 4.1.1 Invitation Flow (Sender)
**Entry Points:**
- Settings page: "Invite Partner" button
- Dashboard prompt: "Add your partner to see complete spending picture"

**Invitation Process:**
1. **Initial Trigger**
   - "Share Account" button in settings
   - User clicks and sees invitation modal

2. **Partner Information**
   ```
   Modal: "Invite Your Partner"
   ├── Email address input (required)
   ├── Display name: "Sarah" (optional)
   └── Personal message (optional): "Let's manage our finances together!"
   ```

3. **Send Confirmation**
   - "Send Invitation" button
   - Confirmation: "Invitation sent! We'll notify you when Sarah joins."

#### 4.1.2 Invitation Flow (Recipient)

**Email Invitation:**
```
Subject: John invited you to manage finances together on Personifi

Hi Sarah!

John invited you to join their personal finance account on Personifi. 
Together you can:
✓ Track shared household expenses
✓ Manage budgets collaboratively  
✓ See real-time spending insights

[Accept Invitation] [Learn More]

This invitation expires in 7 days.
```

**Acceptance Process:**
1. **Click Email Link** → Directed to personifi.com/invite/[token]
2. **Account Creation/Login**
   - New users: Streamlined signup flow
   - Existing users: Sign in with existing account

3. **Simple Acceptance**
   ```
   "John invited you to collaborate on Personifi"
   
   You'll be able to:
   ├── View and add transactions
   ├── Manage shared budgets
   └── See spending analytics
   
   [Accept & Join] [Decline]
   ```

4. **Welcome Setup**
   ```
   "Welcome to shared finance management!"
   
   ├── Set your display name: "Sarah"
   ├── Choose your avatar color
   └── Ready to start!
   
   [Get Started]
   ```

### 4.2 Individual Transaction Ownership (MVP)

#### Transaction Attribution
- **Creator Badge**: Each transaction shows who added it
- **Visual Indicators**: 
  ```
  🏠 Groceries - $47.83
  Added by John • Today 2:30 PM
  
  🚗 Gas - $35.20  
  Added by You • Yesterday
  ```

#### Edit Permissions (MVP - Simple)
- **Own Transactions**: Full edit/delete access
- **Partner's Transactions**: Full edit/delete access (shared account = shared control)

### 4.3 Unified Dashboard Experience

#### Multi-User Transaction List
```
August 14, 2024
├── 🏠 Groceries - $47.83 (John)
├── ☕ Coffee - $4.50 (Sarah)
└── 🚗 Gas - $35.20 (John)

August 13, 2024  
├── 🍕 Dinner - $28.45 (Sarah)
└── 💊 Pharmacy - $12.30 (John)
```

#### Shared Categories & Budgets
- All categories shared between partners
- All budget limits shared and editable by both
- Combined spending totals and analytics

---

## 5. User Experience Flow

### 5.1 First-Time Collaboration Journey

1. **Onboarding Prompt**
   ```
   "Managing finances with someone? 
   Invite them to see your complete financial picture together."
   
   [Invite Partner] [Maybe Later]
   ```

2. **Success Metrics Tracking**
   - Invitation sent
   - Partner signup
   - First shared transaction
   - 7-day collaboration milestone

### 5.2 Shared Dashboard Experience

#### Dashboard Enhancements
- **Partner Activity**: "Sarah added 3 transactions today"
- **Combined Totals**: "Together you've spent $456 this month"
- **Shared Budgets**: Combined progress bars

---

## 6. Technical Considerations (MVP)

### 6.1 Data Architecture
- **User-Account Relationship**: Many-to-many (simple join table)
- **Transaction Ownership**: Each transaction linked to creator user_id
- **Shared Data**: All categories, budgets, and transactions visible to all account members

### 6.2 Security (MVP)
- **Invitation Tokens**: Secure, time-limited (7-day expiration)
- **Data Encryption**: All financial data encrypted
- **Account Separation**: Users can leave shared accounts cleanly

---

## 7. Success Metrics (MVP)

### 7.1 Adoption Metrics
- **Invitation Send Rate**: % of users who send invitations within 30 days
- **Invitation Accept Rate**: % of invitations accepted within 7 days  

### 7.2 Engagement Metrics
- **Multi-User Activity**: % of transactions added by secondary users
- **Session Frequency**: Increased app usage in shared accounts

---

## 8. MVP Implementation Scope

### ✅ Included in MVP
- Basic invitation system (email-based)
- Transaction ownership and attribution  
- Shared dashboard view (all data visible to all users)
- User management (add/remove users from account)
- Combined analytics and budgets

### ❌ Excluded from MVP (Future Phases)
- Permission levels (Full Partner vs View Only vs Contributor)
- Privacy controls and granular data sharing
- Individual category management  
- Historical data sharing options
- Real-time notifications and activity feeds
- Advanced collaboration tools

### MVP Success Definition
The MVP will be considered successful when:
1. **30% of active users** send at least one invitation
2. **20% of all accounts** become multi-user accounts  
3. **Multi-user accounts show 50% higher engagement**
4. **<10% churn rate** due to collaboration issues

---

## 9. Implementation Notes

### Phase 1: MVP Foundation
- Simple email invitation system
- User-account many-to-many relationship
- Transaction attribution (created_by_user_id)
- Shared view of all financial data
- Basic user management interface

### Future Considerations
The MVP intentionally keeps collaboration simple - all users see all data and can edit everything. This reduces complexity while validating the core value proposition. Privacy controls and permission levels can be added in Phase 2 based on user feedback and adoption data.