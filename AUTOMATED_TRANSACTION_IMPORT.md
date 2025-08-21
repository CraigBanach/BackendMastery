● PRD: Automated Transaction Import and Categorization for Personifi

Overview

Enable users to automatically import transactions from their Starling Bank account into Personifi, replacing the manual
process of transferring data to Google Sheets. Users can review, categorize, split, and selectively import transactions
through a streamlined interface.

Background

Currently, users manually copy transactions from Starling Bank's mobile app into Google Sheets for budgeting and expense
tracking. This manual process is time-consuming and error-prone. Personifi should automate this workflow while giving users
full control over transaction categorization and import decisions.

Goals

- Primary: Automate transaction ingestion from Starling Bank
- Secondary: Provide transaction review and categorization workflow
- Tertiary: Enable transaction splitting across multiple categories

---

Technical Options Analysis

Integration Approaches

Option 1: Starling Bank Official API ⭐ RECOMMENDED

- Feasibility: High - Starling has a robust Open Banking API
- Authentication: OAuth 2.0 with user consent
- Data Access: Real-time transaction data, account balances, metadata
- Limitations: Requires user to grant API access, subject to rate limits
- Implementation: 2-3 weeks development time

Option 2: Open Banking API (Generic)

- Feasibility: Medium - Works with multiple banks including Starling
- Authentication: Strong Customer Authentication (SCA) required
- Data Access: Standardized transaction format
- Limitations: More complex integration, 90-day re-authentication
- Implementation: 4-6 weeks development time

Option 3: CSV/QIF Import

- Feasibility: High - Simple file-based import
- Authentication: None required
- Data Access: User exports from Starling app manually
- Limitations: Still manual step, no real-time sync
- Implementation: 1-2 weeks development time

Recommendation: Start with Option 1 (Starling API) for MVP, with architecture that supports future bank integrations via Open
Banking.

---

MVP Feature Specification

Core Features

1. Bank Account Connection

- User Story: As a user, I want to securely connect my Starling Bank account so I can import transactions
- Implementation:
  - OAuth 2.0 flow with Starling Bank
  - Store encrypted access tokens
  - Support multiple accounts per user (for couples)
- Acceptance Criteria:
  - Users can authenticate with Starling via OAuth
  - Multiple bank accounts can be connected per user
  - Connection status is clearly displayed
  - Users can disconnect accounts

2. Transaction Import

- User Story: As a user, I want to import my recent transactions so I can categorize them in Personifi
- Implementation:
  - Manual import trigger (button in UI)
  - Fetch transactions from last 30 days initially
  - Store raw transaction data temporarily for review
- Acceptance Criteria:
  - Users can trigger import manually
  - Transactions are fetched from connected accounts
  - Import progress is shown to user
  - Import errors are handled gracefully

3. Duplicate Detection

- User Story: As a user, I want the system to identify potential duplicates so I don't import the same transaction twice
- Implementation:
  - Match on: amount, date (±1 day), description similarity
  - Flag potential duplicates for user review
  - Allow user to mark as "not a duplicate"
- Acceptance Criteria:
  - Potential duplicates are flagged during import
  - Users can review and decide on duplicates
  - False positives can be overridden

4. Transaction Review Interface

- User Story: As a user, I want to review all imported transactions before they're added to my budget
- Implementation:
  - Pending transactions table/list
  - Bulk actions (approve all, categorize all as X)
  - Individual transaction edit capabilities
- Acceptance Criteria:
  - All imported transactions require explicit approval
  - Users can categorize, edit, or reject transactions
  - Bulk operations are available for efficiency

5. Transaction Categorization

- User Story: As a user, I want to assign imported transactions to my existing budget categories
- Implementation:
  - Dropdown/searchable list of existing categories
  - Quick category assignment
  - "Uncategorized" default state
- Acceptance Criteria:
  - Users can assign any existing category
  - Category assignment is required for approval
  - Category can be changed after import

6. Transaction Splitting

- User Story: As a user, I want to split a single transaction across multiple categories (e.g., grocery shopping that includes
  household items and food)
- Implementation:
  - Split transaction into multiple line items
  - Ensure total equals original amount
  - Replace original transaction with split items
- Acceptance Criteria:
  - Users can split transactions into 2+ categories
  - Split amounts must equal original total
  - Original transaction is replaced, not duplicated

User Interface

Import Dashboard

┌─ Connected Accounts ─────────────────────────────┐
│ 🏦 Starling - Joint Account [Connected] [⚙️] │
│ 🏦 Starling - Personal Account [Connected] [⚙️] │
│ [+ Connect Another Account] │
└─────────────────────────────────────────────────┘

┌─ Import Transactions ────────────────────────────┐
│ Last import: 2 days ago │
│ [Import New Transactions] [View Pending: 0] │
└─────────────────────────────────────────────────┘

Review Interface

┌─ Pending Transactions (3) ──────────────────────┐
│ [Approve All] [Reject All] │
│ │
│ ✓ Tesco Extra £85.42 [Groceries ▼] │
│ ⚠️ Amazon Purchase £156.78 [Uncategorized ▼] │ 🔄 Split
│ ✓ Salary £2,500 [Income ▼] │
│ │
│ [Cancel] [Approve Selected (2)] │
└─────────────────────────────────────────────────┘

Technical Architecture

Database Schema Extensions

-- New tables for transaction import
CREATE TABLE bank_connections (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
bank_name VARCHAR(50) NOT NULL,
account_id VARCHAR(100) NOT NULL,
access_token_encrypted TEXT NOT NULL,
refresh_token_encrypted TEXT,
connected_at TIMESTAMP DEFAULT NOW(),
last_sync TIMESTAMP,
is_active BOOLEAN DEFAULT true
);

CREATE TABLE pending_transactions (
id SERIAL PRIMARY KEY,
bank_connection_id INTEGER REFERENCES bank_connections(id),
external_transaction_id VARCHAR(100) NOT NULL,
amount DECIMAL(10,2) NOT NULL,
description TEXT NOT NULL,
transaction_date DATE NOT NULL,
raw_data JSONB, -- Store original bank data
status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, duplicate
category_id INTEGER REFERENCES categories(id),
created_at TIMESTAMP DEFAULT NOW(),
UNIQUE(bank_connection_id, external_transaction_id)
);

CREATE TABLE transaction_splits (
id SERIAL PRIMARY KEY,
pending_transaction_id INTEGER REFERENCES pending_transactions(id),
category_id INTEGER REFERENCES categories(id),
amount DECIMAL(10,2) NOT NULL,
description TEXT
);

API Endpoints

POST /api/bank-connections/connect
POST /api/bank-connections/{id}/disconnect
GET /api/bank-connections

POST /api/transactions/import
GET /api/transactions/pending
POST /api/transactions/pending/{id}/approve
POST /api/transactions/pending/{id}/reject
PUT /api/transactions/pending/{id}/categorize
POST /api/transactions/pending/{id}/split

GET /api/transactions/duplicates
POST /api/transactions/duplicates/{id}/merge

Implementation Plan

Phase 1: Foundation (Week 1-2)

- Set up Starling Bank API integration
- Create bank connection management
- Basic transaction fetching

Phase 2: Core Import (Week 3-4)

- Transaction import workflow
- Duplicate detection logic
- Pending transactions management

Phase 3: Review Interface (Week 5-6)

- Build transaction review UI
- Implement categorization
- Add bulk operations

Phase 4: Advanced Features (Week 7-8)

- Transaction splitting functionality
- Polish and testing
- Error handling improvements

Success Metrics

User Adoption

- Target: 80% of active users connect at least one bank account within 30 days
- Metric: Bank connections / active users

Efficiency Improvement

- Target: Reduce manual transaction entry by 90%
- Metric: Manual transactions vs imported transactions ratio

User Satisfaction

- Target: 95% of imported transactions are approved (not rejected)
- Metric: Approved transactions / total imported transactions

Future Enhancements (Post-MVP)

Phase 2 Features

- Auto-categorization: ML-based category suggestions
- Recurring transaction detection: Identify and auto-approve regular payments
- Multiple bank support: Extend beyond Starling to other UK banks
- Scheduled imports: Automatic daily/weekly imports
- Smart notifications: Alert users to unusual spending patterns

Phase 3 Features

- Receipt matching: OCR integration for receipt categorization
- Merchant enrichment: Enhanced transaction descriptions via third-party APIs
- Export capabilities: Export processed data back to Excel/CSV
- Advanced splitting: Percentage-based splits, recurring split templates

Risk Assessment

Technical Risks

- API Rate Limits: Starling may limit API calls
  - Mitigation: Implement exponential backoff, cache data appropriately
- Token Expiration: User tokens may expire requiring re-authentication
  - Mitigation: Implement refresh token flow, graceful re-auth prompts

Business Risks

- Regulatory Changes: Open Banking regulations may change
  - Mitigation: Monitor regulatory landscape, maintain compliance
- Bank API Changes: Starling may modify their API
  - Mitigation: Version API calls, maintain backward compatibility

User Experience Risks

- Security Concerns: Users may be hesitant to connect bank accounts
  - Mitigation: Clear security messaging, display bank-grade security badges
- Complex Review Process: Too many pending transactions may overwhelm users
  - Mitigation: Smart defaults, bulk operations, progressive disclosure

Conclusion

This transaction import feature will significantly improve the user experience by automating the most tedious part of expense
tracking. The phased approach ensures we deliver value quickly while building toward a comprehensive solution that can scale
to support multiple banks and advanced categorization features.

The technical foundation using Starling's official API provides a secure, reliable integration that users can trust with their
financial data, while the review-first approach ensures users maintain full control over their budget categorization.
