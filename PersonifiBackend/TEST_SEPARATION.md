# Test Separation Guide

This project uses test categorization to separate unit tests from integration tests, allowing for faster feedback loops and better CI/CD pipeline organization.

## Test Categories

### Unit Tests (`[Trait("Category", "Unit")]`)
- **Controllers**: Test controller logic with mocked dependencies
- **Services**: Test business logic with mocked repositories
- **Middleware**: Test middleware behavior in isolation
- **Repositories**: Test data access logic (when implemented)

### Integration Tests (`[Trait("Category", "Integration")]`)
- **API Endpoints**: Full HTTP stack testing with database
- **Authentication**: End-to-end auth flows
- **Database Operations**: Real database interactions

## Running Tests

### Command Line

**Run all tests:**
```bash
dotnet test
```

**Run only unit tests:**
```bash
dotnet test --filter "Category=Unit"
```

**Run only integration tests:**
```bash
dotnet test --filter "Category=Integration"
```

**Run with specific settings:**
```bash
# Unit tests with coverage
dotnet test --settings unit-tests.runsettings

# Integration tests with coverage
dotnet test --settings integration-tests.runsettings
```

### Visual Studio Test Explorer

1. **Search/Filter Box:**
   ```
   Trait:"Category" Unit        # Shows only unit tests
   Trait:"Category" Integration # Shows only integration tests
   ```

2. **Group By Traits:**
   - Click **Group By** dropdown → Select **"Traits"**
   - Tests organize into **"Category: Unit"** and **"Category: Integration"** folders
   - Right-click folders to run all tests in that category

3. **Filter Menu:**
   - Click **Filter** icon (funnel) → **"Trait"** → **"Category"**
   - Select **"Unit"** or **"Integration"**

4. **Run Settings:**
   - Test → Configure Run Settings → Select Settings File
   - Choose `unit-tests.runsettings` or `integration-tests.runsettings`

5. **Keyboard Shortcuts:**
   - `Ctrl+R, A` - Run All Tests
   - `Ctrl+R, T` - Run Tests in Current Context

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Runs unit tests first** (fast feedback)
2. **Runs integration tests in parallel** (slower but comprehensive)
3. **Comments on PRs** with detailed statistics for each test type
4. **Provides separate coverage reports** for unit and integration tests

### Pipeline Benefits

- **Faster Feedback**: Unit tests complete quickly, giving immediate feedback
- **Parallel Execution**: Both test types run simultaneously
- **Separate Reporting**: Clear visibility into which test type is failing
- **Granular Statistics**: Detailed pass/fail/skip counts for each category

## Test Statistics in PR Comments

The CI/CD pipeline automatically comments on PRs with:

- **Test Results**: ✅ Pass, ❌ Fail, ⚠️ Skipped
- **Detailed Statistics**: Total, Passed, Failed, Skipped counts
- **Success Rate**: Percentage of tests passing
- **Category-Specific Context**: Unit vs Integration test insights

## Best Practices

1. **Unit Tests Should Be:**
   - Fast (< 1 second each)
   - Isolated (no external dependencies)
   - Deterministic (same result every time)
   - Focused on single units of code

2. **Integration Tests Should Be:**
   - Comprehensive (test full workflows)
   - Realistic (use real database/HTTP)
   - Isolated per test (clean state)
   - Focused on component interaction

3. **Development Workflow:**
   - Run unit tests frequently during development
   - Run integration tests before committing
   - Use CI/CD pipeline for comprehensive testing

## Adding New Tests

### Using Explicit Traits

Use explicit `[Fact]` and `[Trait]` attributes to categorize tests:

```csharp
public class MyServiceTests
{
    [Fact]
    [Trait("Category", "Unit")]
    public void MyUnitTest()
    {
        // Unit test implementation
    }
    
    [Fact]
    [Trait("Category", "Unit")]
    public async Task MyAsyncUnitTest()
    {
        // Async unit test implementation
    }
}

public class MyIntegrationTests : IntegrationTestBase
{
    [Fact]
    [Trait("Category", "Integration")]
    public async Task MyIntegrationTest()
    {
        // Integration test implementation
    }
}
```

### Test Categorization Approach

This project uses explicit xUnit traits for test categorization:

```csharp
[Fact]
[Trait("Category", "Unit")]
public void MyUnitTest() { }

[Fact]
[Trait("Category", "Integration")]
public void MyIntegrationTest() { }
```

- **`[Fact]`**: Standard xUnit test attribute
- **`[Trait("Category", "Unit/Integration")]`**: Categorization metadata for filtering

### Key Benefits

- **Explicit and Clear**: No hidden functionality, what you see is what you get
- **Standard xUnit**: Uses standard xUnit attributes without custom extensions
- **Full Compatibility**: Works with Test Explorer, CLI, and CI/CD
- **Simple**: No complex attribute inheritance or discovery mechanisms
- **Maintainable**: Straightforward trait management