using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<IReadOnlyList<RefreshToken>> GetActiveByUserIdAsync(int userId);
    Task RevokeAllAsync(int userId);
}
