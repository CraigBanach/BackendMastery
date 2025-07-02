# ADR-004: Background Services for Scheduled Tasks

**Date:** 2025-06-07
**Status:** Accepted
**Deciders:** Craig Banach
**Technical Story:** Budget alerts implementation

## Context

Need to run periodic tasks:

- Check budgets and send alerts
- Generate monthly reports
- Clean up old data
- Must be reliable and testable

## Decision

Use .NET's BackgroundService:

- Hosted within the API application
- Simple time-based scheduling
- Scoped service resolution
- Structured logging

## Consequences

**Positive:**

- Built into .NET, no additional dependencies
- Runs in-process, easy to debug
- Shares application configuration
- Good for learning async patterns

**Negative:**

- Not suitable for distributed scenarios
- No built-in retry/circuit breaker
- Runs on all instances if scaled horizontally
- No job history or monitoring UI

## Alternatives Considered

1. **Hangfire**: More features but additional dependency
2. **Quartz.NET**: Powerful but complex for simple needs
3. **Azure Functions/AWS Lambda**: Better for scale but vendor lock-in
4. **Separate console app with cron**: More complex deployment
