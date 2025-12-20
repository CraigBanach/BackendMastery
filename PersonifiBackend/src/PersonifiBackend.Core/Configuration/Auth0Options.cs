namespace PersonifiBackend.Core.Configuration;

public class Auth0Options
{
    public const string SectionName = "Auth0";

    public string Domain { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string LocalSigningKey { get; set; } = string.Empty;
}
