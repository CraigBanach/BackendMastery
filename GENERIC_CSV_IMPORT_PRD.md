# Generic CSV Import - Phase 2: Basic Column Mapping

## Overview
Enable users to import CSV files from any bank by providing a simple column mapping interface. This replaces the current Starling Bank-specific CSV parser with a flexible system that supports common banking CSV formats.

## Problem Statement
Currently, the CSV import feature only works with Starling Bank exports. Users with other banks cannot import their transaction data, limiting the app's usability. Making this generic will significantly expand the user base.

## Goals
- Support CSV imports from any bank
- Maintain simplicity - avoid overengineering 
- Provide clear user guidance for format requirements
- Handle common CSV variations gracefully

## Non-Goals (Phase 2)
- Auto-detection of CSV formats
- Bank-specific presets
- Complex data transformation rules
- Support for non-CSV formats

## User Stories

### Primary Flow
1. **As a user**, I want to upload any bank's CSV file so I can import my transactions regardless of my bank
2. **As a user**, I want a simple mapping interface so I can tell the system which columns contain my transaction data
3. **As a user**, I want clear error messages when my CSV format isn't supported so I know how to fix it

### Secondary Flow  
4. **As a user**, I want format guidelines so I know how to prepare my CSV file before uploading
5. **As a user**, I want to download a template so I can reformat my data if needed

## Technical Requirements

### Core Field Mapping
Support mapping for these **required fields**:
- **Date**: Transaction date
- **Description**: Transaction description/merchant name (maps to Reference field in backend)
- **Amount**: Transaction amount

### Date Format Support
- UK format: `dd/MM/yyyy` (current)
- US format: `MM/dd/yyyy` 
- ISO format: `yyyy-MM-dd`
- Auto-detect based on first valid date found

### Amount Handling
Support two amount conventions:
- **Expenses Positive**: Expenses positive, income negative (current Starling)
- **Expenses Negative**: Expenses negative, income positive (most banks)
- User selects convention during mapping

### CSV Format Requirements
- First row must be headers
- Minimum 3 columns (Date, Description, Amount)
- UTF-8 encoding support
- Handle quoted fields with commas
- Skip empty rows

## User Experience Design

### Import Flow
```
1. User uploads CSV file
   ↓
2. System parses headers and shows preview (first 5 rows)
   ↓  
3. User maps columns using dropdowns:
   - Date Column: [Select from headers]
   - Description Column: [Select from headers]  
   - Amount Column: [Select from headers]
   - Amount Convention: [Expenses Positive | Expenses Negative]
   ↓
4. User clicks "Import with these settings"
   ↓
5. System processes file with mapping
   ↓
6. Redirect to review pending transactions
```

### Mapping Interface Mockup
```
┌─────────────────────────────────────────────────┐
│ CSV Preview (showing first 5 rows)             │
├─────────────────────────────────────────────────┤
│ Date     | Description    | Amount | Balance    │
│ 01/08/25 | Tesco         | -45.67 | 1234.56   │
│ 02/08/25 | Salary        | 2000.00| 3234.56   │
├─────────────────────────────────────────────────┤
│ Column Mapping                                  │
│ Date Column*:        [Date ▼]                  │
│ Description Column*: [Description ▼]           │
│ Amount Column*:      [Amount ▼]                │
│ Amount Convention*:  [○ Expenses Negative       │
│                      ● Expenses Positive]      │
│                                                 │
│ [Import with these settings]                    │
└─────────────────────────────────────────────────┘
```

## Implementation Approach

### Backend Changes
1. **New DTOs**:
   - `CsvColumnMapping` - stores user's column selections
   - `ImportTransactionsWithMappingRequest` - includes file + mapping

2. **Updated Parser**:
   - Replace hardcoded Starling logic with flexible field extraction
   - Support multiple date formats with auto-detection
   - Handle different amount sign conventions
   - Maintain existing duplicate detection logic

3. **New Endpoints**:
   - `POST /api/TransactionImport/preview` - parse headers, return preview
   - `POST /api/TransactionImport/with-mapping` - import with user mapping

### Frontend Changes
1. **Updated Import Flow**:
   - File upload → Preview → Mapping → Import
   - Replace auto-import with mapping step

2. **New Components**:
   - `CsvPreviewTable` - show first 5 rows 
   - `ColumnMappingForm` - dropdown selectors for mapping
   - `FormatGuidelinesCard` - help text for users

### Error Handling
- **Invalid CSV**: "File format not supported. Please ensure first row contains headers."
- **Missing required columns**: "Please map Date, Description, and Amount columns."
- **Date parsing failures**: "Unable to parse dates. Supported formats: dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd"
- **Amount parsing failures**: "Unable to parse amounts in [column]. Please ensure numeric values."

## Success Metrics
- **Usage**: % of imports using non-Starling formats
- **Success Rate**: % of uploads that complete successfully  
- **User Feedback**: Support tickets related to CSV import
- **Adoption**: New user signups after CSV feature expansion

## Acceptance Criteria

### Must Have
- [ ] User can upload CSV with any column order/names
- [ ] User can map Date, Description, Amount fields via dropdowns
- [ ] System supports 3 date formats (dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd)  
- [ ] System handles both expense-positive and expense-negative conventions
- [ ] CSV preview shows first 5 rows before mapping
- [ ] Error messages guide users to fix format issues
- [ ] Existing Starling import continues to work (backwards compatibility)

### Should Have  
- [ ] Template CSV download for users who want to reformat
- [ ] Format guidelines/help text on import page
- [ ] Graceful handling of quoted fields with commas

### Could Have
- [ ] Remember user's mapping preferences for future uploads
- [ ] Validation warnings for suspicious data (future dates, extreme amounts)

## Technical Risks
- **CSV parsing complexity**: Edge cases with quoting, encoding, special characters
- **Date ambiguity**: 01/02/2025 could be Jan 2 or Feb 1
- **Performance**: Large CSV files (>10MB) may timeout
- **User confusion**: Too many mapping options could overwhelm users

## Mitigation Strategies
- Start with simple field mapping, add complexity later
- Provide clear examples and format guidance
- Set file size limits and chunked processing if needed
- Extensive testing with real bank CSV exports

## Timeline Estimate
- **Backend API changes**: 3-4 days
- **Frontend UI components**: 3-4 days  
- **Integration & testing**: 2-3 days
- **Total**: ~2 weeks

## Follow-up (Phase 3)
- Bank-specific presets (Barclays, HSBC, etc.)
- Auto-detection of common formats
- Support for Excel files (.xlsx)
- Bulk import from multiple files