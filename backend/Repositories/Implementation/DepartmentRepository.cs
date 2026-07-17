using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class DepartmentRepository : GenericRepository<Department>, IDepartmentRepository
{
    public DepartmentRepository(AppDbContext context) : base(context) { }

    public override async Task<PagedResponse<Department>> GetPagedAsync(DTOs.Common.PageRequest request)
    {
        var query = _dbSet.Include(d => d.Employees).AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(d => d.Name.Contains(request.Search));
        var totalCount = await query.CountAsync();
        query = query.OrderBy(d => d.Name);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new DTOs.Common.PagedResponse<Department> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<Department?> GetByNameAsync(string name) => await _dbSet.FirstOrDefaultAsync(d => d.Name == name);
    public async Task<IReadOnlyList<Department>> GetActiveDepartmentsAsync() => await _dbSet.Where(d => d.IsActive).OrderBy(d => d.Name).ToListAsync();
}
