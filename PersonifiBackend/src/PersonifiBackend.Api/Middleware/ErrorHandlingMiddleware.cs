using PersonifiBackend.Core.Exceptions;
using System.Net;
using System.Text.Json;

namespace PersonifiBackend.Api.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Access denied"),
            ArgumentException => (HttpStatusCode.BadRequest, "Invalid request data"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Resource not found"),
            DuplicateResourceException ex => (HttpStatusCode.Conflict, ex.Message),
            InvalidCategoriesException ex => (HttpStatusCode.NotFound, ex.Message),
            _ => (HttpStatusCode.InternalServerError, "An error occurred while processing your request")
        };

        var response = new
        {
            error = new
            {
                message = message,
                type = exception.GetType().Name
            }
        };

        context.Response.StatusCode = (int)statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}