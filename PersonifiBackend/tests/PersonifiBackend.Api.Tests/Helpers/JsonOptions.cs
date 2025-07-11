using System.Text.Json;
using System.Text.Json.Serialization;

public static class JsonOptions
{
    public static readonly JsonSerializerOptions Default = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    static JsonOptions()
    {
        Default.Converters.Add(new JsonStringEnumConverter());
    }
}
