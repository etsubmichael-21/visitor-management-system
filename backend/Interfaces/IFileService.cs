namespace EcxVisitorManagement.Interfaces;

public interface IFileService
{
    Task<string> UploadPhotoAsync(IFormFile file, string subfolder = "photos");
    Task<(string FilePath, int FileSize)> UploadAttachmentAsync(IFormFile file, string subfolder = "attachments");
    Task<bool> DeleteFileAsync(string filePath);
}
