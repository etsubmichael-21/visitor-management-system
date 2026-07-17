using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Visitors;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/visitors")]
[Authorize]
public class VisitorsController : ControllerBase
{
    private readonly IVisitorService _visitorService;

    public VisitorsController(IVisitorService visitorService) => _visitorService = visitorService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PageRequest request)
    {
        var result = await _visitorService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<VisitorResponseDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _visitorService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<VisitorResponseDto>.NotFound("Visitor not found"));
        return Ok(ApiResponse<VisitorResponseDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VisitorCreateDto dto)
    {
        var result = await _visitorService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<VisitorResponseDto>.Created(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] VisitorUpdateDto dto)
    {
        try
        {
            var result = await _visitorService.UpdateAsync(id, dto);
            return Ok(ApiResponse<VisitorResponseDto>.Ok(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<VisitorResponseDto>.NotFound(ex.Message));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _visitorService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Ok(null!, "Deleted successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.NotFound(ex.Message));
        }
    }

    [HttpPost("{id}/photo")]
    public async Task<IActionResult> UploadPhoto(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.BadRequest("No file provided"));

        try
        {
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "photos");
            Directory.CreateDirectory(uploadsDir);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);
            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);
            var photoUrl = $"/uploads/photos/{fileName}";
            var url = await _visitorService.UploadPhotoAsync(id, photoUrl);
            return Ok(ApiResponse<object>.Ok(new { photoUrl = url }));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.NotFound(ex.Message));
        }
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var request = new PageRequest { Page = page, PageSize = pageSize, Search = q };
        var result = await _visitorService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<VisitorResponseDto>>.Ok(result));
    }
}
