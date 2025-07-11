using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using PersonifiBackend.Api.Tests.Fixtures;

public abstract class IntegrationTestBase
    : IClassFixture<CustomWebApplicationFactory<Program>>,
        IDisposable
{
    protected readonly CustomWebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;

    protected IntegrationTestBase(CustomWebApplicationFactory<Program> factory)
    {
        Factory = factory;
        Client = Factory.CreateClient(
            new WebApplicationFactoryClientOptions { AllowAutoRedirect = false }
        );

        // Set default auth header
        Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Test");
    }

    public void Dispose()
    {
        Client?.Dispose();
    }
}
