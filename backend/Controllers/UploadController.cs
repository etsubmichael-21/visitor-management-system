using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/upload")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadController(IWebHostEnvironment env) => _env = env;

    [HttpPost("photo")]
    public async Task<IActionResult> UploadPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.BadRequest("No file provided"));

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(ApiResponse<object>.BadRequest("Invalid file type. Allowed: jpg, jpeg, png, gif, webp"));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.BadRequest("File size exceeds 5MB limit"));

        var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "photos");
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        var url = $"/uploads/photos/{fileName}";
        return Ok(ApiResponse<object>.Ok(new { url }));
    }

    [HttpPost("attachment")]
    public async Task<IActionResult> UploadAttachment(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.BadRequest("No file provided"));

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.BadRequest("File size exceeds 10MB limit"));

        var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "attachments");
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsDir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        var url = $"/uploads/attachments/{fileName}";
        return Ok(ApiResponse<object>.Ok(new { url, fileName = file.FileName, size = file.Length }));
    }

    [HttpPost("document")]
    public async Task<IActionResult> UploadDocument(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.BadRequest("No file provided"));

        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(ApiResponse<object>.BadRequest("Invalid file type. Allowed: pdf, doc, docx, xls, xlsx, txt, csv"));

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.BadRequest("File size exceeds 10MB limit"));

        var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "documents");
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        var url = $"/uploads/documents/{fileName}";
        return Ok(ApiResponse<object>.Ok(new { url, fileName = file.FileName, size = file.Length }));
    }

    [HttpDelete("{type}/{fileName}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteFile(string type, string fileName)
    {
        var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", type);
        var filePath = Path.Combine(uploadsDir, fileName);
        if (!System.IO.File.Exists(filePath))
            return NotFound(ApiResponse<object>.NotFound("File not found"));

        System.IO.File.Delete(filePath);
        return Ok(ApiResponse<object>.Ok(null!, "File deleted"));
    }
}
