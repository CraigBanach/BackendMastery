# Product Requirements Document: Flexible Savings Buckets & Month-End Review

## 1. Overview

**Feature Name:** Flexible Savings Buckets
**Goal:** Empower users to track long-term savings and debts ("Buckets") separately from their monthly operational budget, offering a "Savings Jar" model rather than strict accounting rollovers.
**Core Principle:** "Buckets are containers for value. Categories are channels for spending. You decide when money moves between them."

## 2. Problem Statement

Currently, Personifi budgets are isolated to a specific month.

- **Surplus Loss:** If a user saves £50 on groceries in January, that value disappears in February.
- **Debt Amnesia:** Overspending in January is "forgotten" in February, preventing accountability.
- **Rigidity:** Users cannot easily group multiple categories (e.g., "His Flight", "Her Hotel") into a single savings goal (e.g., "Holiday Fund").

## 3. Solution: The Bucket Model

Instead of automatic, invisible rollovers, we introduce **Buckets**—persistent internal accounts that hold value across months.

### Key Concepts

1.  **Buckets ≠ Categories:**

    - A **Bucket** is a container (e.g., "Emergency Fund", "Car Repairs").
    - A **Category** is a label for transactions (e.g., "Mechanic", "Car Parts").
    - **Relationship:** Many-to-One (or None). Multiple categories can feed into one bucket. A category can also have _no_ bucket (surpluses simply vanish).

2.  **The "Month-End Review" Ritual:**
    - Buckets are not updated automatically.
    - At the start of a new month, users review their performance and _explicitly_ decide to transfer surpluses/deficits to their buckets.

## 4. User Stories

### A. Setup & Management

- **As a user,** I want to create a Bucket (e.g., "Holiday Fund") and give it a target amount.
- **As a user,** I want to link specific spending categories to this Bucket so that I know which budgets contribute to it.
- **As a user,** I want to link _multiple_ categories (e.g., "Fuel", "Service") to a single "Car" bucket.

### B. The Month-End Review

- **As a user,** I want to be notified when a month is over so I can "close" it.
- **As a user,** I want to see a summary of my budget performance (Budget vs Actual) for all bucket-linked categories.
- **As a user,** I want to confirm, edit, or reject transfers to my buckets (e.g., "I saved £50 on food, but I only want to put £20 in the bucket").

### C. Transaction Editing (The "Ripple")

- **As a user,** when I add/edit a transaction in the _current_ month, I want it to just update my "Remaining Budget" for the month.
- **As a user,** when I edit a transaction from a _past_ (closed) month, I want the option to update the associated Bucket Balance (or not).
  - _Scenario:_ "I forgot a £100 expense from last month." -> Checkbox: "Update [Holiday Fund] balance?" -> Checked: Fund drops by £100. Unchecked: History updates, but Fund stays the same.

## 5. Technical Architecture

### 5.1 Database Schema

New entities to support persistent balances and audit trails.

**`Buckets` Table**

- `Id` (PK)
- `AccountId` (FK)
- `Name` (text)
- `Color` (text)
- `CurrentBalance` (decimal) - _The source of truth._
- `TargetAmount` (decimal, nullable)

**`BucketTransactions` Table** (Audit Log)

- `Id` (PK)
- `BucketId` (FK)
- `Amount` (decimal) - (+ for Deposit, - for Withdrawal)
- `Type` (enum: `MonthEndAdjustment`, `ManualTransfer`, `TransactionCorrection`)
- `Description` (text)
- `SourceTransactionId` (FK, nullable) - _Link to original expense if applicable._

**`Categories` Table Update**

- `BucketId` (FK, nullable) - _Links category to a bucket._

### 5.2 API Endpoints

**Bucket Management**

- `GET /api/buckets`: List all buckets with balances.
- `POST /api/buckets`: Create new.
- `PUT /api/categories/{id}/link-bucket`: Link/Unlink a category.

**Month-End Workflow**

- `GET /api/budget/review-preview`: Calculates proposed transfers based on last month's variance.
- `POST /api/budget/close-month`: Commits the transfers (creates `BucketTransactions` and updates `CurrentBalance`).

**Transaction Handling**

- `POST/PUT /api/transactions`: Accepted payload includes `updateBucket: boolean`.
  - If `TransactionDate` is in a past month AND `updateBucket` is true -> Trigger `BucketService.AdjustBalance()`.

## 6. UI/UX Requirements

### 6.1 Dashboard

- **Bucket Sidebar/Widget:** Visual list of buckets with progress bars towards Targets.
- **Budget Rows:** Categories linked to a bucket should show a small "Bucket Icon" badge next to their name.

### 6.2 Bucket Manager Page

- Drag-and-drop interface to organize categories into Buckets.
- "Unassigned Categories" pool on one side, "Buckets" on the other.

### 6.3 Month-End Review Wizard

- **Step 1:** "You have 3 buckets to update."
- **Step 2:** List rows:
  - [Category Name] | Budget: £100 | Actual: £80 | **Surplus: £20** -> [Transfer to Bucket Input]
- **Step 3:** Confirmation Summary.

### 6.4 Transaction Modal (Ripple Logic)

- **Condition:** Show "Update Bucket" checkbox ONLY if:
  1.  The category is linked to a bucket.
  2.  The transaction date is before the current month (i.e., a closed period).
- **Label:** "Update [Bucket Name] balance?"
- **Tooltip:** "Unchecking this will update history but leave your savings balance unchanged."

## 7. Future Considerations (Post-MVP)

- **Goal Dates:** "Save £1,000 by December."
- **Auto-Close:** Automatically approve transfers if user doesn't review within X days (optional setting).
- **Bucket-to-Bucket Transfers:** Move money from "Car" to "Holiday" manually.
