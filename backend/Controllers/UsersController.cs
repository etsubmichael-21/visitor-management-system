using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Users;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService) => _userService = userService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PageRequest request)
    {
        var result = await _userService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<UserResponseDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _userService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<UserResponseDto>.NotFound("User not found"));
        return Ok(ApiResponse<UserResponseDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
    {
        try
        {
            var result = await _userService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<UserResponseDto>.Created(result));
        }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<UserResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto dto)
    {
        try
        {
            var result = await _userService.UpdateAsync(id, dto);
            return Ok(ApiResponse<UserResponseDto>.Ok(result));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<UserResponseDto>.NotFound(ex.Message)); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _userService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Ok(null!, "Deleted successfully"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }

    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(int id)
    {
        try
        {
            var result = await _userService.ActivateAsync(id);
            return Ok(ApiResponse<UserResponseDto>.Ok(result, "User activated"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<UserResponseDto>.NotFound(ex.Message)); }
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        try
        {
            var result = await _userService.DeactivateAsync(id);
            return Ok(ApiResponse<UserResponseDto>.Ok(result, "User deactivated"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<UserResponseDto>.NotFound(ex.Message)); }
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id)
    {
        try
        {
            var newPassword = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(12));
            await _userService.ResetPasswordAsync(id, newPassword);
            return Ok(ApiResponse<object>.Ok(new { newPassword }, "Password reset successfully"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }
}
