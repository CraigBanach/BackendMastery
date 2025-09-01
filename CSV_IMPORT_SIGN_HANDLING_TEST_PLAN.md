# CSV Import Sign Handling Test Plan

## Overview
This test plan verifies that CSV transaction imports handle amount signs correctly across different amount conventions, ensuring that:
- Income transactions are always stored as positive amounts
- Expense transactions are always stored as positive amounts  
- The preview accurately reflects how transactions will be classified
- The approval process maintains consistent positive storage

## Test Scenarios

### 1. Expenses Negative Convention Tests
**CSV File:** `test-expenses-negative.csv`
**Amount Convention:** "Expenses are negative amounts"

| Transaction Type | CSV Amount | Expected Preview Classification | Expected Final Amount |
|-----------------|------------|--------------------------------|----------------------|
| Salary Income   | 2500.00    | Income (+2500.00)             | +2500.00            |
| Rent Expense    | -1200.00   | Expense (1200.00)             | +1200.00            |
| Grocery Expense | -85.50     | Expense (85.50)               | +85.50              |
| Refund Income   | 45.00      | Income (+45.00)               | +45.00              |

**Test Steps:**
1. Upload `test-expenses-negative.csv`
2. Select "Expenses are negative amounts" convention
3. Verify preview shows correct classifications
4. Approve all transactions
5. Verify final transactions have positive amounts

### 2. Expenses Positive Convention Tests  
**CSV File:** `test-expenses-positive.csv`
**Amount Convention:** "Expenses are positive amounts"

| Transaction Type | CSV Amount | Expected Preview Classification | Expected Final Amount |
|-----------------|------------|--------------------------------|----------------------|
| Salary Income   | -2500.00   | Income (+2500.00)             | +2500.00            |
| Rent Expense    | 1200.00    | Expense (1200.00)             | +1200.00            |
| Grocery Expense | 85.50      | Expense (85.50)               | +85.50              |
| Refund Income   | -45.00     | Income (+45.00)               | +45.00              |

**Test Steps:**
1. Upload `test-expenses-positive.csv`
2. Select "Expenses are positive amounts" convention  
3. Verify preview shows correct classifications
4. Approve all transactions
5. Verify final transactions have positive amounts

### 3. Mixed Transaction Types Test
**CSV File:** `test-mixed-transactions.csv`
**Test both conventions with comprehensive transaction types**

| Description | Amount | Type | Notes |
|------------|--------|------|-------|
| Salary Payment | 3000.00 | Income | Monthly salary |
| Bonus | 500.00 | Income | Performance bonus |
| Rent | -1500.00 | Expense | Monthly rent |
| Utilities | -120.00 | Expense | Electric bill |
| Groceries | -75.25 | Expense | Weekly shopping |
| Gas | -45.00 | Expense | Fuel |
| Tax Refund | 850.00 | Income | Government refund |
| Insurance Refund | 125.00 | Income | Overpayment refund |
| Restaurant | -65.00 | Expense | Dinner out |
| Coffee | -4.50 | Expense | Daily coffee |

### 4. Income to Expense Category Test
**CSV File:** `test-income-to-expense-categories.csv`
**Test Focus:** Verify that income transactions assigned to expense categories are stored as negative amounts (credits)

| Description | CSV Amount | Expected Preview | Expected Behavior When Assigned to Expense Category | Expected Final Amount |
|------------|------------|------------------|--------------------------------------------------|----------------------|
| Large Salary | 50000.00 | Income (+50000.00) | Credit to expense category | -50000.00 |
| Small Refund | 0.99 | Income (+0.99) | Credit to expense category | -0.99 |
| Cashback | 25.00 | Income (+25.00) | Credit to expense category | -25.00 |
| Tax Refund | 850.00 | Income (+850.00) | Credit to expense category | -850.00 |
| Insurance Refund | 125.50 | Income (+125.50) | Credit to expense category | -125.50 |

**Test Steps:**
1. Upload `test-income-to-expense-categories.csv` with "Expenses are negative amounts" convention
2. Verify all transactions are classified as income in preview (positive amounts)
3. During approval, assign income transactions to expense categories (e.g., "Car Maintenance", "Groceries")  
4. Verify final transactions are stored with **negative** amounts (representing credits to expense categories)
5. Verify budget calculations correctly handle negative amounts as credits

### 5. Edge Cases Test  
**CSV File:** `test-edge-cases.csv`

| Description | Amount | Expected Behavior | Notes |
|------------|--------|------------------|-------|
| Zero Amount | 0.00 | Handle gracefully | Zero transactions |
| Large Amount | 50000.00 | Process normally | High-value income |
| Small Amount | 0.01 | Process normally | Minimal transaction |
| Negative Zero | -0.00 | Handle as zero | Edge case |

## Validation Checklist

### Import Phase
- [ ] CSV uploads successfully
- [ ] Amount convention selection works
- [ ] Preview shows correct transaction classifications
- [ ] Preview amounts display with correct signs
- [ ] All transactions appear in pending state

### Approval Phase  
- [ ] Individual transaction approval works
- [ ] Bulk approval works for all transactions
- [ ] Same-type assignments (income→income, expense→expense) stored with positive amounts
- [ ] Cross-type assignments (income→expense, expense→income) stored with negative amounts  
- [ ] Transaction types correctly assigned (income/expense)
- [ ] Categories properly assigned
- [ ] Income assigned to expense categories creates negative amounts (credits)

### Database Verification
- [ ] Same-type assignments stored with positive amounts in database
- [ ] Cross-type assignments stored with negative amounts in database  
- [ ] Income→expense assignments create negative amounts (credits)
- [ ] Transaction types correctly stored
- [ ] No data corruption during approval process
- [ ] Pending transactions cleaned up after approval

### UI Verification
- [ ] Transactions display correctly in transactions list
- [ ] Income shows as positive in UI
- [ ] Expenses show appropriately in UI context
- [ ] Monthly summaries calculate correctly
- [ ] Budget calculations work properly

## Expected Outcomes

### Success Criteria
1. **Canonical Storage**: Pending transactions stored with positive=income, negative=expense after import
2. **Cross-Type Handling**: Income assigned to expense categories stored as negative (credits)
3. **Same-Type Handling**: Transactions assigned to same category type stored as positive
4. **Correct Classification**: Income/expense types assigned based on amount convention during import
5. **UI Consistency**: Transaction display matches expected user mental model
6. **Data Integrity**: No sign-related calculation errors in budgets/summaries
7. **Credit Logic**: Income applied to expense categories correctly reduces expense totals

### Regression Prevention
- Import preview accurately reflects final storage
- Approval process doesn't introduce sign errors
- Database constraints maintain data consistency
- UI calculations handle positive amounts correctly

## Test Execution Notes

1. **Test Order**: Run expenses negative tests first, then expenses positive
2. **Clean State**: Clear pending transactions between test runs
3. **Verification**: Check both UI and database for final amounts
4. **Edge Cases**: Pay special attention to zero and boundary values
5. **Performance**: Verify bulk operations complete successfully

## Bug Reproduction
If issues are found:
1. Note the specific CSV file and amount convention
2. Record the transaction that failed
3. Capture preview vs. final amount discrepancy
4. Check database state before and after approval
5. Verify against expected behavior in test plan