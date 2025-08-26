# Transaction Splitting & Custom Descriptions Feature - PRD

## Overview
Allow users to split imported transactions across multiple categories during the transaction review process, with custom amounts and descriptions for each split. Also enable custom descriptions for single-category transaction approvals.

## Requirements

### Core Functionality
1. **Split Interface Location**: Transaction review page (`/import/review`) - appears inline for pending transactions
2. **Split Creation**: Users can split a single imported transaction into multiple separate transactions
3. **Category Assignment**: Each split gets its own category via dropdown selection
4. **Custom Descriptions**: 
   - Each split can have a custom description
   - Single-category approvals can also have custom descriptions
   - Custom descriptions are in addition to inherited transaction details (counter party, reference, etc.)
5. **Amount Distribution**: Users can specify custom amounts for each split

### User Experience

#### Single Transaction Approval
1. **Enhanced Approval Interface**:
   - Category dropdown (existing)
   - Optional custom description input field
   - "Approve" button

#### Split Transaction Approval
1. **Adding Splits**: 
   - "Split Transaction" button/option alongside single category approval
   - Inline interface allows adding multiple split items
   - Each split item has: category dropdown, amount input, description input, remove button

2. **Automatic Amount Distribution**:
   - When adding new splits, auto-divide remaining amount evenly among all splits
   - Only auto-divide if user hasn't manually modified any split amounts
   - Real-time calculation shows remaining/allocated amounts

3. **Validation**:
   - Split amounts should equal original transaction amount
   - Validation is a "nudge" (warning message) not a hard block
   - Users can proceed with mismatched amounts if needed

4. **Split Management**:
   - Add new split items dynamically
   - Remove individual split items
   - Minimum of 2 splits required (otherwise just use regular single-category approval)

### Data Storage
1. **Multiple Transactions**: Each split becomes a separate transaction in the database
2. **Single Transaction**: Regular approvals create one transaction with optional custom description
3. **No Additional Metadata**: No special split tracking tables needed
4. **Import Tracking**: Original import transaction ID should be preserved for duplicate detection in future imports
5. **Transaction Fields**: Each transaction (split or single) gets:
   - Amount (full amount for single, proportional for splits)
   - Selected category
   - Custom description (if provided)
   - All other original transaction metadata (date, counter party, reference, etc.)

### Backend Changes Required
1. **Update Existing API**: `POST /api/TransactionImport/pending/{id}/approve`
   - Add optional `description` field to existing request
   ```json
   {
     "categoryId": 1,
     "notes": "existing notes field",
     "description": "custom description for this transaction"
   }
   ```

2. **New API Endpoint**: `POST /api/TransactionImport/pending/{id}/approve-split`
   - Request Model: 
   ```json
   {
     "splits": [
       {
         "categoryId": 1,
         "amount": 25.50,
         "description": "Custom description for this split"
       },
       {
         "categoryId": 2, 
         "amount": 14.50,
         "description": "Another custom description"
       }
     ]
   }
   ```

3. **Response**: Standard approval response (removes from pending list)

### Frontend Changes Required
1. **Review Page Updates**: 
   - Add optional description input to existing single-category approval
   - Add "Split Transaction" toggle/button to pending transaction actions
   - Inline split interface with add/remove split items
   - Real-time amount validation and remaining calculation
   - Split amount inputs with category dropdowns and description fields

2. **Validation UI**:
   - Visual indicator when split amounts don't match transaction total
   - Warning message but allow proceeding
   - Clear indication of remaining/excess amounts

## Technical Implementation Notes

### Backend Considerations
- Update existing `ApprovePendingTransactionRequest` to include optional description
- Create new `ApprovePendingTransactionSplitRequest` for split approvals
- Reuse existing transaction creation logic
- Each split transaction should have same import reference for duplicate detection
- Consider using database transaction to ensure all splits are created atomically
- Update pending transaction status to 'Approved' after successful split creation

### Frontend Considerations  
- State management for dynamic split items
- Debounced amount calculations to avoid excessive re-renders
- Form validation that doesn't block submission
- Responsive design for mobile split interface
- Toggle between single approval and split approval modes

## Success Criteria
1. Users can add custom descriptions to single-category transaction approvals
2. Users can split any pending transaction into 2+ categories
3. Split amounts can be customized with real-time validation feedback
4. Each split can have a unique description
5. Split transactions appear as normal transactions after approval
6. Original import transaction tracking preserved for duplicate detection
7. Mobile-friendly interface maintains usability

## Future Enhancements (Out of Scope)
- Splitting already-approved transactions
- Bulk split operations
- Split transaction templates/presets
- Percentage-based splitting instead of fixed amounts
- Editing descriptions of existing transactions