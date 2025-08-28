- Validate duplicate import functionality
- Align the expense & income categories
- Allow deleting of categories with transactions
- Clarify CSV format for upload
- Onboarding flow
  - Default category setup
  - Default budgets

# Next Prompt

● Refined Schema Design:

Core Relationships:

Subscription (1) → Users (many)
Subscription (1) → Account (1)
Account (1) → Financial Data (many)

Entity Structure:

Subscriptions: - id - stripe_customer_id - stripe_subscription_id - plan_type ('couples', 'family') - status ('active', 'trialing', 'canceled') - owner_user_id (billing contact) - account_id (the household account) - billing_period_start/end

Users: - id - auth0_user_id - email - subscription_id (FK to Subscriptions) - role ('owner', 'member')

Account: (stays mostly the same) - id - name - subscription_id (FK to Subscriptions) - Financial data relationships remain unchanged

Benefits of This Design:

✅ Simpler relationships - no complex many-to-many UserAccount junction
✅ Clear ownership - subscription has one owner who handles billing
✅ Natural couples model - one subscription = one household
✅ Easy plan enforcement - subscription controls user limits and features
✅ Cleaner billing - one subscription, one account, multiple users

Key Changes Needed:

1. Remove UserAccount junction table (no longer needed)
2. Add subscription_id to Users (direct relationship)
3. Add account_id to Subscriptions (1:1 relationship)
4. Add user roles directly on Users table
5. Update all queries to use Users.subscription_id instead of UserAccount joins

Migration Strategy:

1. Create Subscriptions for each existing Account
2. Link all Users in each Account to the new Subscription
3. Set first User as subscription owner
4. Remove UserAccount relationships
5. Update all data access patterns

This is much cleaner! Does this refined approach align with your vision? Should we start implementing these schema changes?

> Let's strip out everything from subscriptions & users that are not needed right now, like the stripe stuff, plan type, status
> & billing period. We can add them later.

Also, can you dump this to a markdown file so we can pick it up later?
