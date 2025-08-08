namespace Cache;

public interface ICache
{
    public Result<T> Get<T>(string key);

    public bool Set<T>(string key, T? value);

    public bool Remove(string key);
}

