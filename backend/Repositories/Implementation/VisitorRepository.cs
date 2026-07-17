using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class VisitorRepository : GenericRepository<Visitor>, IVisitorRepository
{
    public VisitorRepository(AppDbContext context) : base(context) { }

    public override async Task<PagedResponse<Visitor>> GetPagedAsync(DTOs.Common.PageRequest request)
    {
        var query = _dbSet.AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(v => v.FullName.Contains(request.Search) || v.Email.Contains(request.Search) || v.Phone.Contains(request.Search));
        var totalCount = await query.CountAsync();
        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDesc ? query.OrderByDescending(v => v.FullName) : query.OrderBy(v => v.FullName),
            "email" => request.SortDesc ? query.OrderByDescending(v => v.Email) : query.OrderBy(v => v.Email),
            _ => query.OrderByDescending(v => v.CreatedAt)
        };
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new DTOs.Common.PagedResponse<Visitor> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<Visitor?> GetByEmailAsync(string email) => await _dbSet.FirstOrDefaultAsync(v => v.Email == email);
    public async Task<Visitor?> GetByNationalIdAsync(string nationalId) => await _dbSet.FirstOrDefaultAsync(v => v.NationalId == nationalId);
    public async Task<Visitor?> GetByPhoneAsync(string phone) => await _dbSet.FirstOrDefaultAsync(v => v.Phone == phone);

    public async Task<IReadOnlyList<Visitor>> SearchAsync(string query) =>
        await _dbSet.Where(v => v.FullName.Contains(query) || v.Email.Contains(query) || v.Phone.Contains(query)).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetAppointmentsAsync(int visitorId) =>
        await _context.Appointments.Where(a => a.VisitorId == visitorId).Include(a => a.Employee).ThenInclude(e => e.Department)
            .OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Visit>> GetVisitsAsync(int visitorId) =>
        await _context.Visits.Where(v => v.VisitorId == visitorId).Include(v => v.Employee).ThenInclude(e => e.Department)
            .OrderByDescending(v => v.CreatedAt).ToListAsync();
}
