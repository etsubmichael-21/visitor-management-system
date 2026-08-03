using EcxVisitorManagement.DTOs.Auth;

namespace EcxVisitorManagement.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> RegisterVisitorAsync(RegisterVisitorRequest request);
    Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task LogoutAsync(int userId, string refreshToken);
    Task<LoginResponse?> GetCurrentUserAsync(int userId);
}
