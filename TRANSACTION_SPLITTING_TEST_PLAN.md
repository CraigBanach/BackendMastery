# Transaction Splitting & Custom Descriptions Test Plan

## Test Data
Use the provided `test-transactions.csv` file which contains:
- **Expenses**: TESCO (-£45.67), AMAZON (-£12.99), SHELL (-£38.90), etc.
- **Income**: SALARY (+£2500.00), FREELANCE (+£750.00), DIVIDEND (+£45.50)

## Prerequisites
1. Have expense categories set up: `Groceries`, `Transport`, `Dining`, `Housing`, `Subscriptions`
2. Have income categories set up: `Salary`, `Freelance`, `Investments`
3. Import the test CSV file

## Test Cases

### 1. Single Transaction Approval with Custom Description
**Test**: Approve TESCO transaction to Groceries category
- **Input**: Category = `Groceries`, Custom Description = `Weekly grocery shopping at Tesco`
- **Expected**: Transaction stored as +£45.67 with custom description
- **Verify**: Check transaction appears in transactions list with correct amount and description

### 2. Expense Split - Normal Case (Expense → Expense Categories)
**Test**: Split RESTAURANT transaction (-£85.40)
- **Input**: 
  - Split 1: `Dining`, £60.00, Description: `Main meal`
  - Split 2: `Dining`, £25.40, Description: `Drinks`
- **Expected**: 
  - Split 1 stored as +£60.00 
  - Split 2 stored as +£25.40
- **Verify**: Both splits show as positive amounts in database

### 3. Income Split - Normal Case (Income → Income Categories)  
**Test**: Split SALARY transaction (+£2500.00)
- **Input**:
  - Split 1: `Salary`, £2000.00, Description: `Base salary`
  - Split 2: `Investments`, £500.00, Description: `Retirement contribution`
- **Expected**:
  - Split 1 stored as +£2000.00
  - Split 2 stored as +£500.00
- **Verify**: Both splits show as positive amounts in database

### 4. Cross-Type Split - Income → Expense Categories
**Test**: Split FREELANCE income (+£750.00) to expense categories
- **Input**:
  - Split 1: `Transport`, £300.00, Description: `Business travel costs`
  - Split 2: `Subscriptions`, £450.00, Description: `Software licenses`
- **Expected**:
  - Split 1 stored as -£300.00 (negative because income assigned to expense category)
  - Split 2 stored as -£450.00 (negative because income assigned to expense category)
- **Verify**: Both splits show as negative amounts in database

### 5. Cross-Type Split - Expense → Income Categories
**Test**: Split AMAZON expense (-£12.99) to income category
- **Input**:
  - Split 1: `Freelance`, £12.99, Description: `Business expense reimbursement`
- **Expected**:
  - Split 1 stored as -£12.99 (negative because expense assigned to income category)
- **Verify**: Split shows as negative amount in database

### 6. Split Amount Validation
**Test**: Create split with mismatched amounts
- **Input**: Split COFFEE SHOP (-£4.50) into £2.00 + £3.00 = £5.00 (over by £0.50)
- **Expected**: 
  - Warning message shown: "£0.50 over budget"
  - User can still proceed with approval
- **Verify**: Warning appears but submission is not blocked

### 7. Split Assignment Display
**Test**: Verify split assignment status shows correctly
- **Input**: After completing any split from tests above
- **Expected**: 
  - Green status box shows "✓ Split into X categories:"
  - Each split shows: category icon, name, custom description (if different from transaction), amount
  - Mobile and desktop views both work
- **Verify**: Split details are clearly displayed

### 8. Navigation Flow
**Test**: Import → Review navigation
- **Input**: Import the CSV file
- **Expected**:
  - Import page shows "Pending Transactions Need Review" alert
  - "Review Now" button navigates to review page
  - Review page shows "Back to Import" button
- **Verify**: Smooth navigation between import and review

### 9. Auto-Amount Distribution
**Test**: Add/remove splits with auto-distribution
- **Input**: 
  1. Start splitting TESCO transaction (£45.67)
  2. Add third split without modifying amounts
  3. Remove one split
- **Expected**:
  - Initial: £22.84 + £22.83 (auto-distributed)
  - After adding: £15.22 + £15.22 + £15.23 (auto-redistributed)  
  - After removing: £22.84 + £22.83 (auto-redistributed)
- **Verify**: Amounts auto-adjust when not manually modified

### 10. Default Description Behavior
**Test**: Verify description defaults
- **Input**: Start any split or single approval
- **Expected**:
  - Single approval: Description input placeholder shows transaction counter party
  - Split approval: Each split defaults to transaction counter party
  - Custom descriptions can override defaults
- **Verify**: Placeholder text and default values work correctly

## Database Verification Queries
After each test, verify in the database:

```sql
-- Check transaction amounts and descriptions
SELECT Amount, Description, CategoryId, Notes 
FROM Transactions 
WHERE CreatedAt > 'today' 
ORDER BY CreatedAt DESC;

-- Verify category assignments
SELECT t.Amount, c.Name as CategoryName, c.Type as CategoryType, t.Description
FROM Transactions t
JOIN Categories c ON t.CategoryId = c.Id
WHERE t.CreatedAt > 'today'
ORDER BY t.CreatedAt DESC;
```

## Success Criteria
- ✅ All single transactions approve with correct amounts and custom descriptions
- ✅ Expense splits to expense categories store as positive amounts  
- ✅ Income splits to income categories store as positive amounts
- ✅ Cross-type splits store as negative amounts
- ✅ Split assignment status displays correctly on both mobile and desktop
- ✅ Amount validation provides feedback but doesn't block submission
- ✅ Navigation between import and review works smoothly
- ✅ Auto-distribution works when amounts aren't manually modified
- ✅ Description defaults and customization work as expected

## Edge Cases to Test
1. **Zero amount splits**: Try splitting with £0.00 amounts
2. **Single penny differences**: Test rounding with amounts like £10.01 split into 3
3. **Large amounts**: Test with amounts over £10,000
4. **Special characters**: Test descriptions with emojis, quotes, etc.
5. **Network errors**: Test behavior when API calls fail
6. **Concurrent splits**: Test splitting multiple transactions simultaneously

This test plan ensures comprehensive coverage of the transaction splitting and custom description functionality across all major use cases and edge cases.