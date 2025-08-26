# Category and Budget Improvements - Test Plan

## Overview
This document outlines the test plan for implementing multiple improvements to the category and budget management system.

## Improvements Being Implemented

### 1. Change 'Budget' to 'Expected Income' for Income Categories
**Description**: Update UI text to show "Expected Income" instead of "Budget" when creating/editing income categories.

**Test Cases:**
- [ ] **TC1.1**: Create new income category - label should show "Monthly Expected Income (Optional)"
- [ ] **TC1.2**: Create new expense category - label should still show "Monthly Budget (Optional)"
- [ ] **TC1.3**: Edit existing income category - label should show "Monthly Expected Income (Optional)"
- [ ] **TC1.4**: Edit existing expense category - label should still show "Monthly Budget (Optional)"
- [ ] **TC1.5**: Switch between Income/Expense types in modal - label should update dynamically

**Expected Results:**
- Income categories use "Expected Income" terminology
- Expense categories continue using "Budget" terminology
- Dynamic updates when switching category types

### 2. Fix Edit Category Pre-population
**Description**: Ensure all fields (name, type, icon, color, budget amount) are pre-populated when editing a category.

**Test Cases:**
- [ ] **TC2.1**: Edit category with all fields - all should be pre-populated
- [ ] **TC2.2**: Edit category with missing optional fields - required fields should be populated
- [ ] **TC2.3**: Edit category with existing budget - budget amount should be pre-populated
- [ ] **TC2.4**: Edit category without existing budget - budget field should be empty
- [ ] **TC2.5**: Cancel editing should reset to original values

**Expected Results:**
- All available category data pre-fills the form
- Form validation works with pre-populated data
- Cancellation properly resets form

### 3. Split Categories into Income/Expense Sections
**Description**: Change categories page layout to show separate sections instead of just filter buttons.

**Test Cases:**
- [ ] **TC3.1**: Page loads with "Income Categories" and "Expense Categories" sections
- [ ] **TC3.2**: Categories are correctly sorted into their respective sections
- [ ] **TC3.3**: Empty sections show appropriate messages
- [ ] **TC3.4**: Add category button works from both sections
- [ ] **TC3.5**: Mobile layout handles sections appropriately
- [ ] **TC3.6**: Edit/delete actions work from both sections

**Expected Results:**
- Clear visual separation between Income and Expense categories
- Improved UX with logical grouping
- All existing functionality preserved

### 4. Fix Creating Category to Apply Budget
**Description**: When creating a category with a budget amount, actually create the budget entry.

**Test Cases:**
- [ ] **TC4.1**: Create expense category with budget amount - budget entry should be created
- [ ] **TC4.2**: Create income category with expected income - budget entry should be created
- [ ] **TC4.3**: Create category without budget amount - no budget entry created
- [ ] **TC4.4**: Budget entry should be for current month/year
- [ ] **TC4.5**: Budget amount should match entered value
- [ ] **TC4.6**: Budget should be visible in budget page after creation

**Expected Results:**
- Budget entries automatically created when amounts specified
- Proper integration between category and budget systems
- No orphaned categories without corresponding budgets

### 5. Add Skeleton Loading for Import Page Infinite Scroll
**Description**: Show loading skeletons when more transactions are being loaded via infinite scroll.

**Test Cases:**
- [ ] **TC5.1**: Scroll to bottom triggers skeleton loading animation
- [ ] **TC5.2**: Skeletons appear for appropriate duration
- [ ] **TC5.3**: Skeletons are replaced by actual transaction data
- [ ] **TC5.4**: Loading states don't interfere with user interactions
- [ ] **TC5.5**: Multiple consecutive loads handle properly

**Expected Results:**
- Smooth loading experience with visual feedback
- No flashing or jarring transitions
- Performance remains good during loading

### 6. Budget Page Month Preservation with URL Params
**Description**: Preserve selected month when refreshing budget page using URL parameters.

**Test Cases:**
- [ ] **TC6.1**: Navigate to specific month - URL should update (e.g., /budget?month=2025-08)
- [ ] **TC6.2**: Refresh page with month param - should stay on same month
- [ ] **TC6.3**: Bookmark URL with month - should open to correct month
- [ ] **TC6.4**: Share URL with month - recipient sees correct month
- [ ] **TC6.5**: Navigate back/forward - month state preserved
- [ ] **TC6.6**: Invalid month param - should default to current month

**Expected Results:**
- URLs are bookmarkable and shareable
- Page refresh preserves user state
- Browser navigation works intuitively

### 7. Implement Proper Approved/Rejected Tracking in Backend
**Description**: Add proper tracking of approved and rejected transactions in import history.

**Test Cases:**
- [ ] **TC7.1**: Approve transaction - count should increment approved total
- [ ] **TC7.2**: Reject transaction - count should increment rejected total
- [ ] **TC7.3**: Import history shows accurate counts
- [ ] **TC7.4**: Counts persist across page refreshes
- [ ] **TC7.5**: Multiple users don't interfere with each other's counts
- [ ] **TC7.6**: Split transactions count appropriately
- [ ] **TC7.7**: Bulk operations update counts correctly

**Expected Results:**
- Accurate tracking of all transaction decisions
- Proper database persistence
- Clear display in import history

## Testing Environment Setup

### Prerequisites
- Backend running with database
- Frontend development server
- Test data including:
  - Multiple categories of both types
  - Transactions in various states
  - Budget entries for testing
  - Import history with various statuses

### Test Data Requirements
- At least 5 income categories with varying budgets
- At least 5 expense categories with varying budgets
- Pending transactions for import testing
- Historical imports with known transaction counts

## Test Execution Notes

### Manual Testing Steps
1. **Start with clean state** - Clear any test data
2. **Execute each test case systematically**
3. **Document actual results vs expected**
4. **Note any edge cases or unusual behavior**
5. **Test across different screen sizes (mobile/desktop)**

### Automated Testing Considerations
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user journeys
- Visual regression tests for UI changes

## Definition of Done
- [ ] All test cases pass
- [ ] No regression in existing functionality
- [ ] Performance remains acceptable
- [ ] Mobile and desktop experiences work well
- [ ] Code is properly documented
- [ ] Backend database changes are migrated
- [ ] Frontend builds without errors or warnings