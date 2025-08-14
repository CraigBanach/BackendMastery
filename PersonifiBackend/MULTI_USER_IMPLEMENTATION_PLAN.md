# Multi-User Implementation Plan - Clean Architecture Refactor

## Current Status

### ✅ Completed Backend Infrastructure
1. **Database Schema**: Complete multi-user schema with Users, Accounts, UserAccounts, and InvitationTokens
2. **Entity Models**: All entities updated to use AccountId instead of UserId
3. **EF Migration**: Database migration ready (`20250814000000_MultiUserSupport.cs`)
4. **Account Service**: Full service for user/account management and invitation flow
5. **User Context**: Updated authentication to handle account-based access
6. **Account Controller**: REST API endpoints for invitation management
7. **Dependency Injection**: All services registered

### 🔄 Currently Working On: Clean Service Layer Refactor

**Decision**: Implementing clean architecture refactor (not quick adapter) for quality MVP.

## Clean Refactor Implementation Plan

### Phase 1: Service Layer Interfaces (CURRENT)
- [ ] Update `ITransactionService` interface: `string userId` → `int accountId`
- [ ] Update `ICategoryService` interface: `string userId` → `int accountId` 
- [ ] Update `IBudgetService` interface: `string userId` → `int accountId`

### Phase 2: Repository Layer Interfaces
- [ ] Update `ITransactionRepository` interface: `string userId` → `int accountId`
- [ ] Update `ICategoryRepository` interface: `string userId` → `int accountId`
- [ ] Update `IBudgetRepository` interface: `string userId` → `int accountId`

### Phase 3: Service Implementations
- [ ] Update `TransactionService` implementation
- [ ] Update `CategoryService` implementation
- [ ] Update `BudgetService` implementation

### Phase 4: Repository Implementations
- [ ] Update `TransactionRepository` implementation
- [ ] Update `CategoryRepository` implementation
- [ ] Update `BudgetRepository` implementation

### Phase 5: DTOs and Mapping
- [ ] Add user attribution to `TransactionDto` (CreatedByUserId field)
- [ ] Update AutoMapper profiles for new fields
- [ ] Update Create/Update DTOs as needed

### Phase 6: Controller Updates
- [ ] Update `TransactionController` to use accountId and handle account creation
- [ ] Update `CategoryController` to use accountId
- [ ] Update `BudgetController` to use accountId

### Phase 7: Account Creation Logic
- [ ] Implement "create account on first transaction" logic
- [ ] Update seed data logic for account-based categories
- [ ] Add default categories when new account is created

## Frontend Integration Plan

### Phase 8: Frontend API Integration
- [ ] Create frontend API functions for invitation flow
- [ ] Update existing API calls to handle account-based responses

### Phase 9: Invitation UI
- [ ] Create invitation acceptance page (`/invite/[token]`)
- [ ] Add 'Invite Partner' functionality to settings page
- [ ] Create account management UI (view members, remove users)

### Phase 10: User Attribution Display
- [ ] Update transaction components to show user attribution ("Added by John")
- [ ] Update auth context to handle account-based permissions

### Phase 11: Testing
- [ ] Test complete invitation flow: send → accept → collaborate
- [ ] Test multi-user transaction management and attribution
- [ ] Test data isolation between different accounts

### Phase 12: Documentation
- [ ] Update API documentation and README for multi-user features

## Key Architecture Decisions Made

### Database Design
- **Account-based multi-tenancy**: User belongs to Account, data scoped by AccountId
- **Individual transaction ownership**: Transactions have CreatedByUserId for attribution
- **Database-stored invitation tokens**: 7-day expiration, full control over flow
- **Clean schema**: No existing user data to migrate

### Authentication Flow
- **Auth0 → Internal User mapping**: UserContext resolves Auth0 ID to internal User + Account
- **Account creation**: Triggered on first transaction (not signup)
- **Primary account**: Users can belong to multiple accounts, first is primary

### Invitation System
- **Shareable links**: No email infrastructure needed for MVP
- **Secure tokens**: URL-safe tokens with database validation
- **7-day expiration**: Hard-coded as requested

## Current File Status

### ✅ New Files Created
- `/src/PersonifiBackend.Core/Entities/Account.cs`
- `/src/PersonifiBackend.Core/Entities/User.cs`
- `/src/PersonifiBackend.Core/Entities/UserAccount.cs`
- `/src/PersonifiBackend.Core/Entities/InvitationToken.cs`
- `/src/PersonifiBackend.Core/Interfaces/IAccountService.cs`
- `/src/PersonifiBackend.Infrastructure/Services/AccountService.cs`
- `/src/PersonifiBackend.Infrastructure/Migrations/20250814000000_MultiUserSupport.cs`
- `/src/PersonifiBackend.Api/Controllers/AccountController.cs`

### ✅ Files Updated
- `/src/PersonifiBackend.Core/Entities/Transaction.cs` - Added AccountId, CreatedByUserId
- `/src/PersonifiBackend.Core/Entities/Category.cs` - Added AccountId
- `/src/PersonifiBackend.Core/Entities/Budget.cs` - Added AccountId, Year/Month fields
- `/src/PersonifiBackend.Core/Interfaces/IUserContext.cs` - Updated for multi-user
- `/src/PersonifiBackend.Infrastructure/Services/UserContext.cs` - Account-aware context
- `/src/PersonifiBackend.Infrastructure/Data/PersonifiDbContext.cs` - New entities and relationships
- `/src/PersonifiBackend.Api/Middleware/UserContextMiddleware.cs` - Account resolution
- `/src/PersonifiBackend.Api/Configuration/DependencyInjectionExtensions.cs` - AccountService registration

### 🔄 Files To Update (Service Layer Refactor)
- `/src/PersonifiBackend.Core/Interfaces/ITransactionService.cs`
- `/src/PersonifiBackend.Core/Interfaces/ICategoryService.cs`
- `/src/PersonifiBackend.Core/Interfaces/IBudgetService.cs`
- `/src/PersonifiBackend.Application/Services/TransactionService.cs`
- `/src/PersonifiBackend.Application/Services/CategoryService.cs`
- `/src/PersonifiBackend.Application/Services/BudgetService.cs`
- All repository interfaces and implementations
- `/src/PersonifiBackend.Api/Controllers/TransactionController.cs`
- `/src/PersonifiBackend.Api/Controllers/CategoryController.cs`
- `/src/PersonifiBackend.Api/Controllers/BudgetController.cs`

## API Endpoints Ready

### AccountController
- `POST /api/account/invite` - Send invitation
- `GET /api/account/invitation/{token}` - Get invitation details
- `POST /api/account/invitation/{token}/accept` - Accept invitation
- `GET /api/account/members` - List account members
- `POST /api/account/create` - Create new account

## Next Session Resumption

If resuming in new session, continue from **Phase 1: Service Layer Interfaces** with updating `ITransactionService.cs` to use `int accountId` instead of `string userId`.

The backend foundation is solid - we have proper entity relationships, account service, and invitation system ready. The refactor will make all layers consistently account-aware.