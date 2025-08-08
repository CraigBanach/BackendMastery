# Cache Implementation TODO

## Current Priority: FifoCache LinkedList Implementation
**Context:** Interview practice - implementing cache with different eviction policies

### Immediate Task - LinkedList Refactor (IN PROGRESS)
- [x] **Problem Identified**: Current FifoCache uses Queue + Dictionary but Queue doesn't support O(1) arbitrary removal
- [x] **Solution Decided**: Use Dictionary<string, (object? value, LinkedListNode<string> node)> + LinkedList<string>
- [ ] **NEXT: Implement LinkedList approach** with these key insights:
  - **Set() on existing key = Remove() + Set()** - This refreshes the item's position in eviction order
  - Store LinkedListNode reference in Dictionary for O(1) removal
  - FIFO eviction: RemoveFirst() when at capacity, AddLast() for new items
  - Memory overhead: ~8 bytes per entry (acceptable for performance gain)

### Implementation Details to Remember:
```csharp
// Target data structure:
private readonly Dictionary<string, (object? value, LinkedListNode<string> node)> _dict;
private readonly LinkedList<string> _insertionOrder;
private readonly int _maxCapacity;

// Set() pseudocode:
if (_dict.TryGetValue(key, out var existing))
{
    // Remove from current position (refresh logic)
    _insertionOrder.Remove(existing.node);
}

// Handle capacity
if (_insertionOrder.Count >= _maxCapacity)
{
    var oldest = _insertionOrder.First.Value;
    _insertionOrder.RemoveFirst();
    _dict.Remove(oldest);
}

// Add as newest
var newNode = _insertionOrder.AddLast(key);
_dict[key] = (value, newNode);
```

## Interface Improvements (Future)
- [ ] **Generic Key Type**: Refactor ICache to use generic TKey instead of string keys for better performance and flexibility
- [ ] **Capacity Management**: Add capacity management to ICache interface or constructor - how do implementations know their max size?
- [ ] **TTL/Expiration**: Add TTL/expiration support - decide on per-item TTL vs global TTL approach  
- [ ] **Thread Safety**: Add thread safety guarantees and documentation to interface
- [ ] **Set Return Behavior**: Review Set() return bool behavior - when should it return false? Handle capacity-full scenarios

## Implementation Tasks
- [ ] **Add capacity limits to FifoCache** (part of LinkedList refactor)
- [ ] Implement LRU cache (similar to FIFO but update LinkedList on Get() too)
- [ ] Add thread safety to cache implementations
- [ ] Add performance benchmarking
- [ ] Add unit tests

## Current Code Status
- **ICache interface**: Basic with string keys, Result<T> return pattern
- **Result<T> class**: Has Success(), NotFound(), NotOfTypeT() factory methods
- **FifoCache**: Partially implemented with Queue (has sync issues identified)
- **Key insight**: Queue.Capacity property EXISTS in .NET 9, Dictionary.Remove DOES throw ArgumentNullException

## Design Decisions Made
1. **Result pattern over exceptions** for cache misses
2. **Generic methods over generic interface** to allow multiple value types in same cache
3. **"Remove + Set" semantics** for updating existing keys (refreshes eviction order)
4. **LinkedList + Dictionary hybrid** for O(1) operations on both ends

## Interview Learning Points
- Start simple, iterate (don't over-engineer initially)
- Consider all edge cases (capacity, updates, removes)
- Think about real-world usage patterns
- Memory vs performance trade-offs
- API design for predictable behavior

## Future Enhancements
- [ ] Cache statistics (hit/miss ratios)
- [ ] Async cache operations  
- [ ] Cache warming strategies
- [ ] Serialization support for persistent cache