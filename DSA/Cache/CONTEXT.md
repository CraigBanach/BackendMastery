# Cache Implementation Context & Interview Notes

## Session Context
**Purpose**: Interview practice after struggling with cache design in senior backend engineer interview  
**Goal**: Build interface + implementation, starting with FIFO cache, iterating to improve  
**Language**: C# (.NET 9)  
**Current Status**: Mid-implementation, refactoring from Queue to LinkedList approach

## Interview Learning Experience
**Original Interview Problem**: Create interface and implement cache as library code  
**Struggles**: Basic interface design, data structure choice, edge case handling  
**This Practice Session**: More structured approach, thinking through trade-offs

## Technical Discoveries This Session
1. **Queue<T>.Capacity EXISTS in .NET 9** (contrary to common belief)
2. **Dictionary.Remove() DOES throw ArgumentNullException** when key is null
3. **LinkedList<string> better than Queue<string>** for caches needing arbitrary removal
4. **Storing LinkedListNode references** provides O(1) removal at minimal memory cost

## Key Design Insights Reached
- **Set() on existing key = Remove() + Set()**: Refreshes item position in eviction order
- **Result pattern better than exceptions**: More explicit cache miss handling
- **Generic methods > generic interface**: Allows multiple value types in same cache instance
- **Start simple, iterate**: Don't over-engineer initially, improve through identified pain points

## Current Architecture

### Interface Design
```csharp
public interface ICache
{
    Result<T> Get<T>(string key);
    bool Set<T>(string key, T? value);
    bool Remove(string key);
}
```

### Result Pattern
```csharp
public class Result<T>
{
    public Status Status { get; }
    public T? Value { get; }
    
    public static Result<T> Success(T value) => new(Status.Found, value);
    public static Result<T> NotFound() => new(Status.NotFound);
    public static Result<T> NotOfTypeT() => new(Status.NotOfTypeT);
}

public enum Status { Found, NotOfTypeT, NotFound }
```

### Current FifoCache Issues
- Uses Queue<string> + Dictionary<string, object?>
- Queue doesn't support O(1) arbitrary removal
- Remove() and Set() (on existing keys) create synchronization problems
- Identified need for LinkedList approach

### Target Implementation (LinkedList Approach)
```csharp
public class FifoCache : ICache
{
    private readonly Dictionary<string, (object? value, LinkedListNode<string> node)> _dict;
    private readonly LinkedList<string> _insertionOrder;
    private readonly int _maxCapacity;
    
    // Set() logic:
    // 1. If key exists: Remove from LinkedList (refresh position)
    // 2. If at capacity: Remove oldest (First) from both structures
    // 3. Add to LinkedList (Last) and Dictionary
    
    // Remove() logic:
    // 1. Remove from Dictionary
    // 2. Remove node from LinkedList using stored reference
    
    // Get() logic:
    // 1. Dictionary lookup with type checking
    // 2. Return appropriate Result<T>
}
```

## Next Session Tasks
1. **Complete LinkedList refactor** of FifoCache
2. **Test the implementation** with various scenarios
3. **Add capacity management** (constructor parameter)
4. **Handle edge cases** (empty cache, single item, etc.)
5. **Consider thread safety** implications

## Future Improvements (After Core Works)
- Generic key types (TKey instead of string)
- TTL/expiration support
- Thread safety
- LRU cache implementation
- Performance benchmarking
- Unit tests

## Interviewer Feedback Themes
- **Good**: Result pattern, type safety approach, considering edge cases
- **Areas to improve**: Initial data structure choice, thinking through operations holistically
- **Strong finish**: Understanding Set() as "Remove + Set" semantics, memory vs performance trade-offs

## File Structure
```
DSA/Cache/
├── ICache.cs (interface)
├── Result.cs (result pattern)
├── FifoCache.cs (current implementation - needs LinkedList refactor)
├── TODO.md (detailed task list)
├── CONTEXT.md (this file)
└── Cache.csproj
```

## Resume Point
When resumiting: Read TODO.md for immediate next steps, then implement the LinkedList approach in FifoCache.cs with the "Remove + Set" semantics for existing key updates.