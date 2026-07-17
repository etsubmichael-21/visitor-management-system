using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Auth;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(ApiResponse<LoginResponse>.Ok(result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<LoginResponse>.Unauthorized(ex.Message));
        }
    }

    [HttpPost("register-visitor")]
    public async Task<IActionResult> RegisterVisitor([FromBody] RegisterVisitorRequest request)
    {
        try
        {
            var result = await _authService.RegisterVisitorAsync(request);
            return Ok(ApiResponse<LoginResponse>.Ok(result, "Registration successful"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<LoginResponse>.BadRequest(ex.Message));
        }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request);
            return Ok(ApiResponse<LoginResponse>.Ok(result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<LoginResponse>.Unauthorized(ex.Message));
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            await _authService.ChangePasswordAsync(userId, request);
            return Ok(ApiResponse<object>.Ok(null!, "Password changed successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.NotFound(ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(ApiResponse<object>.BadRequest(ex.Message));
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            await _authService.ForgotPasswordAsync(request);
            return Ok(ApiResponse<object>.Ok(null!, "If the email exists, a reset link has been sent"));
        }
        catch (KeyNotFoundException)
        {
            return Ok(ApiResponse<object>.Ok(null!, "If the email exists, a reset link has been sent"));
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            await _authService.ResetPasswordAsync(request);
            return Ok(ApiResponse<object>.Ok(null!, "Password reset successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.BadRequest(ex.Message));
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        await _authService.LogoutAsync(userId, request.RefreshToken);
        return Ok(ApiResponse<object>.Ok(null!, "Logged out successfully"));
    }
}
