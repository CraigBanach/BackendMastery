using System.Net.Http.Json;

namespace PersonifiBackend.Api.Tests.Extensions;

public static class HttpClientExtensions
{
    public static async Task<T?> GetFromJsonAsync<T>(this HttpClient client, string requestUri)
    {
        var response = await client.GetAsync(requestUri);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(JsonOptions.Default);
    }

    public static async Task<HttpResponseMessage> PostAsJsonAsync<T>(
        this HttpClient client,
        string requestUri,
        T value
    )
    {
        return await client.PostAsJsonAsync(requestUri, value, JsonOptions.Default);
    }

    public static async Task<TResponse?> PostFromJsonAsync<TRequest, TResponse>(
        this HttpClient client,
        string requestUri,
        TRequest value
    )
    {
        var response = await client.PostAsJsonAsync(requestUri, value, JsonOptions.Default);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<TResponse>(JsonOptions.Default);
    }

    public static async Task<HttpResponseMessage> PutAsJsonAsync<T>(
        this HttpClient client,
        string requestUri,
        T value
    )
    {
        return await client.PutAsJsonAsync(requestUri, value, JsonOptions.Default);
    }

    public static async Task<TResponse?> PutFromJsonAsync<TRequest, TResponse>(
        this HttpClient client,
        string requestUri,
        TRequest value
    )
    {
        var response = await client.PutAsJsonAsync(requestUri, value, JsonOptions.Default);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<TResponse>(JsonOptions.Default);
    }
}
