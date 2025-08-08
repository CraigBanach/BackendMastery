namespace Cache;

public class Result<T>
{
    public Status Status { get; }
    public T? Value { get; }

    private Result(Status status, T? value = default)
    {
        Status = status;
        Value = value;
    }

    public static Result<T> Success(T value) => new(Status.Found, value);
    public static Result<T> NotFound() => new(Status.NotFound);
    public static Result<T> NotOfTypeT() => new(Status.NotOfTypeT);
}

public enum Status
{
    Found,
    NotOfTypeT,
    NotFound
}