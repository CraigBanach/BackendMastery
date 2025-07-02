# ADR-002: Use PostgreSQL with Entity Framework Core

**Date:** 2025-06-07
**Status:** Accepted
**Deciders:** Craig Banach
**Technical Story:** Database selection

## Context

Need a database solution that:

- Supports complex queries for financial data
- Has good .NET support
- Is free for development
- Scales well for future needs

## Decision

Use PostgreSQL with Entity Framework Core:

- PostgreSQL via Supabase for development
- Entity Framework Core as the ORM
- Code-first migrations
- Repository pattern for data access

## Consequences

**Positive:**

- Free, open-source database
- Excellent .NET support via Npgsql
- Supports advanced features (JSON, full-text search, etc.)
- Supabase provides easy cloud hosting
- EF Core provides LINQ support and migrations

**Negative:**

- EF Core can generate inefficient queries
- Need to manage connection strings securely

## Alternatives Considered

1. **SQL Server**: More common in .NET, but requires licensing
2. **MongoDB**: Good for flexibility, but financial data benefits from ACID
3. **SQLite**: Great for development, but different from production databases
4. **Dapper instead of EF Core**: More control but more boilerplate
