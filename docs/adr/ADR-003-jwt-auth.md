# ADR-003: JWT Authentication with Auth0

**Date:** 2025-06-07
**Status:** Accepted
**Deciders:** Craig Banach
**Technical Story:** Authentication implementation

## Context

Need secure authentication that:

- Supports multiple login providers (social logins)
- Doesn't require managing passwords
- Works well with SPAs
- Is production-ready

## Decision

Use Auth0 for authentication:

- JWT bearer tokens
- Auth0 as the identity provider
- No local user storage initially
- Use JWT 'sub' claim as user identifier

## Consequences

**Positive:**

- No password management needed
- Built-in support for social logins
- Production-ready security
- Free tier sufficient for development
- Industry-standard approach

**Negative:**

- Vendor lock-in
- Need internet connection for development
- Can't easily implement custom auth flows
- Limited to 7,000 monthly active users on free tier

## Alternatives Considered

1. **ASP.NET Core Identity**: More control but more complexity
2. **Cookie authentication**: Not ideal for API-first approach
3. **Azure AD B2C**: Good but more complex setup
