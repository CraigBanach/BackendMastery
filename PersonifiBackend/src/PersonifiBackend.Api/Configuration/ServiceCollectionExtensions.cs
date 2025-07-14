using PersonifiBackend.Infrastructure.Services;

namespace PersonifiBackend.Api.Extensions
{
    public static class DataSeederServiceExtensions
    {
        public static IServiceCollection AddDataSeeder(this IServiceCollection services)
        {
            services.AddScoped<IDataSeederService, DataSeederService>();
            return services;
        }
    }
}
