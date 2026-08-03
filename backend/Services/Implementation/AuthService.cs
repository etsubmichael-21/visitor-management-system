using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Auth;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly Interfaces.IEmailService _emailService;

    public AuthService(AppDbContext context, IConfiguration configuration, Interfaces.IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password");
        //if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        //    throw new UnauthorizedAccessException("Invalid email or password");
        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated");

        user.LastLogin = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        var refreshToken = await GenerateRefreshTokenAsync(user.Id);
        return new LoginResponse
        {
            Token = GenerateJwtToken(user),
            RefreshToken = refreshToken.Token,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            UserId = user.Id,
            EmployeeId = user.EmployeeId,
            VisitorId = user.VisitorId
        };
    }

    public async Task<LoginResponse> RegisterVisitorAsync(RegisterVisitorRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("Email already registered");

        var visitor = new Visitor
        {
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            NationalId = request.NationalId,
            Organization = request.Organization,
            Gender = request.Gender,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.Visitors.Add(visitor);
        await _context.SaveChangesAsync();

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Visitor",
            IsActive = true,
            VisitorId = visitor.Id,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var refreshToken = await GenerateRefreshTokenAsync(user.Id);

        try
        {
            await _emailService.SendWelcomeEmailAsync(visitor.Email, visitor.FullName);
        }
        catch (Exception)
        {
            // Email failure should not block registration
        }

        return new LoginResponse
        {
            Token = GenerateJwtToken(user),
            RefreshToken = refreshToken.Token,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            UserId = user.Id,
            VisitorId = visitor.Id
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var refreshToken = await _context.RefreshTokens.Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && !rt.IsRevoked && rt.ExpiresAt > DateTimeOffset.UtcNow);
        if (refreshToken == null) throw new UnauthorizedAccessException("Invalid refresh token");

        refreshToken.IsRevoked = true;
        var newRefreshToken = await GenerateRefreshTokenAsync(refreshToken.UserId);
        await _context.SaveChangesAsync();

        var user = refreshToken.User;
        return new LoginResponse
        {
            Token = GenerateJwtToken(user),
            RefreshToken = newRefreshToken.Token,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            UserId = user.Id,
            EmployeeId = user.EmployeeId,
            VisitorId = user.VisitorId
        };
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _context.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found");
        if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        try
        {
            await _emailService.SendPasswordChangedEmailAsync(user.Email, user.FullName);
        }
        catch (Exception)
        {
            // Email failure should not block password change
        }
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return;
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            Email = request.Email,
            Token = token,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
            CreatedAt = DateTimeOffset.UtcNow
        });
        await _context.SaveChangesAsync();

        try
        {
            var baseUrl = _configuration["Email:BaseUrl"] ?? "https://visitor.ecx.com.et";
            await _emailService.SendPasswordResetEmailAsync(request.Email, token, baseUrl);
        }
        catch (Exception)
        {
            // Email failure should not block password reset request
        }
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var resetToken = await _context.PasswordResetTokens.FirstOrDefaultAsync(t => t.Token == request.Token && !t.IsUsed && t.ExpiresAt > DateTimeOffset.UtcNow);
        if (resetToken == null) throw new InvalidOperationException("Invalid or expired reset token");
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == resetToken.Email);
        if (user == null) throw new KeyNotFoundException("User not found");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTimeOffset.UtcNow;
        resetToken.IsUsed = true;
        await _context.SaveChangesAsync();
    }

    public async Task LogoutAsync(int userId, string refreshToken)
    {
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId);
        if (token != null) { token.IsRevoked = true; await _context.SaveChangesAsync(); }
    }

    public async Task<LoginResponse?> GetCurrentUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
            return null;
        return new LoginResponse
        {
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            UserId = user.Id,
            EmployeeId = user.EmployeeId,
            VisitorId = user.VisitorId
        };
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role)
        };
        if (user.EmployeeId.HasValue)
            claims.Add(new Claim("EmployeeId", user.EmployeeId.Value.ToString()));
        if (user.VisitorId.HasValue)
            claims.Add(new Claim("VisitorId", user.VisitorId.Value.ToString()));
        var token = new JwtSecurityToken(issuer: _configuration["Jwt:Issuer"], audience: _configuration["Jwt:Audience"], claims: claims, expires: DateTime.UtcNow.AddHours(24), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> GenerateRefreshTokenAsync(int userId)
    {
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
        return refreshToken;
    }
}
