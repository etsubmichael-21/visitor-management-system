using System.Security.Claims;

namespace EcxVisitorManagement.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");
        return int.Parse(value);
    }

    public static int? GetEmployeeId(this ClaimsPrincipal user)
    {
        var value = user.FindFirst("EmployeeId")?.Value;
        return value != null ? int.Parse(value) : null;
    }

    public static int? GetVisitorId(this ClaimsPrincipal user)
    {
        var value = user.FindFirst("VisitorId")?.Value;
        return value != null ? int.Parse(value) : null;
    }

    public static string GetRole(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Role)?.Value ?? "Visitor";
    }

    public static bool IsAdminOrHigher(this ClaimsPrincipal user)
    {
        var role = user.GetRole();
        return role is "Admin" or "CEO" or "DepartmentHead";
    }
}
