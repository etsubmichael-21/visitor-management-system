using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class UserRepository : GenericRepository<User>
{
    public UserRepository(AppDbContext context) : base(context) { }

    public override async Task<PagedResponse<User>> GetPagedAsync(PageRequest request)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim();
            query = query.Where(u => u.FullName.ToLower().Contains(term.ToLower())
                || u.Email.ToLower().Contains(term.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var statuses = request.Status.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            query = query.Where(u => statuses.Contains(u.Role));
        }

        if (request.IsActive.HasValue)
            query = query.Where(u => u.IsActive == request.IsActive.Value);

        var totalCount = await query.CountAsync();
        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDesc ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName),
            "email" => request.SortDesc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "role" => request.SortDesc ? query.OrderByDescending(u => u.Role) : query.OrderBy(u => u.Role),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };

        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new PagedResponse<User> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }
}
