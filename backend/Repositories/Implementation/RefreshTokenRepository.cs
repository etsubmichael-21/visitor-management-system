using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(AppDbContext context) : base(context) { }

    public async Task<RefreshToken?> GetByTokenAsync(string token) =>
        await _dbSet.Include(rt => rt.User).FirstOrDefaultAsync(rt => rt.Token == token);

    public async Task<IReadOnlyList<RefreshToken>> GetActiveByUserIdAsync(int userId) =>
        await _dbSet.Where(rt => rt.UserId == userId && !rt.IsRevoked && rt.ExpiresAt > DateTimeOffset.UtcNow).ToListAsync();

    public async Task RevokeAllAsync(int userId)
    {
        var tokens = await _dbSet.Where(rt => rt.UserId == userId && !rt.IsRevoked).ToListAsync();
        foreach (var t in tokens) t.IsRevoked = true;
        await _context.SaveChangesAsync();
    }
}
