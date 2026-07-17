using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Services.Implementation;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _env;
    public FileService(IWebHostEnvironment env) => _env = env;

    public async Task<string> UploadPhotoAsync(IFormFile file, string subfolder = "photos")
    {
        var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", subfolder);
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsDir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        return $"/uploads/{subfolder}/{fileName}";
    }

    public async Task<(string FilePath, int FileSize)> UploadAttachmentAsync(IFormFile file, string subfolder = "attachments")
    {
        var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", subfolder);
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsDir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        return ($"/uploads/{subfolder}/{fileName}", (int)file.Length);
    }

    public Task<bool> DeleteFileAsync(string filePath)
    {
        var fullPath = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), filePath.TrimStart('/'));
        if (File.Exists(fullPath)) { File.Delete(fullPath); return Task.FromResult(true); }
        return Task.FromResult(false);
    }
}
