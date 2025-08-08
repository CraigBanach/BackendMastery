namespace Cache
{
    public class FifoCache : ICache
    {
        private readonly Dictionary<string, object?> _dict = [];
        private readonly Queue<string> identifierOrder;

        public FifoCache(int capacity)
        {
            identifierOrder = new Queue<string>(capacity);
        }

        public Result<T> Get<T>(string key)
        {
            var success = _dict.TryGetValue(key, out var value);

            if (success)
            {
                if (value is T casted)
                {
                    return Result<T>.Success(casted);
                }
                else
                {
                    return Result<T>.NotOfTypeT();
                }
            }
            else
            {
                return Result<T>.NotFound();
            }
        }

        public bool Remove(string key)
        {
            // Figure out what to do with the identifierOrder in this scenario
            try
            {
                _dict.Remove(key);
            }
            catch (ArgumentNullException) { return false; }

            return true;
        }

        public bool Set<T>(string key, T? value)
        {
            if (_dict.ContainsKey(key))
            {
                // Figure out what to do with the identifierOrder in this scenario
                _dict[key] = value;
            }
            else
            {
                if (identifierOrder.Capacity == identifierOrder.Count)
                {
                    try
                    {
                        _dict.Remove(identifierOrder.Dequeue());
                    }
                    catch (ArgumentNullException)
                    {
                        // Swallow the null exception, in case the key was removed already
                        // This should be changed once we properly handle the identifierOrder
                    }
                }
                _dict.Add(key, value);
                identifierOrder.Enqueue(key);
            }

            return true;
        }
    }
}
