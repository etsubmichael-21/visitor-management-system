using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Repositories.Implementation;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);

    public virtual async Task<IReadOnlyList<T>> GetAllAsync() => await _dbSet.ToListAsync();

    public virtual async Task<PagedResponse<T>> GetPagedAsync(PageRequest request)
    {
        var query = _dbSet.AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(e => EF.Property<string>(e, "Name") != null && EF.Property<string>(e, "Name").Contains(request.Search));
        }
        var total = await query.CountAsync();
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new PagedResponse<T> { Items = items, TotalCount = total, Page = request.Page, PageSize = request.PageSize };
    }

    public virtual async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate) =>
        await _dbSet.Where(predicate).ToListAsync();

    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(T entity)
    {
        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null) =>
        predicate == null ? await _dbSet.CountAsync() : await _dbSet.CountAsync(predicate);

    public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate) =>
        await _dbSet.AnyAsync(predicate);
}
