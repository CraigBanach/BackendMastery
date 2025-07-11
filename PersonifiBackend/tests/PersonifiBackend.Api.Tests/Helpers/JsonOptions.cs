using System.Text.Json;
using System.Text.Json.Serialization;

public static class JsonOptions
{
    public static readonly JsonSerializerOptions Default = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
    };

    static JsonOptions()
    {
        Default.Converters.Add(new JsonStringEnumConverter());
    }
}
