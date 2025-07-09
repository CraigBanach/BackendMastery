using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Filters;

public class RequireAuthenticatedUserAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var userContext = context.HttpContext.RequestServices.GetService<IUserContext>();

        if (userContext == null || !userContext.IsAuthenticated)
        {
            context.Result = new UnauthorizedObjectResult(
                new { error = "User context not available or user not authenticated" }
            );
            return;
        }

        base.OnActionExecuting(context);
    }
}
