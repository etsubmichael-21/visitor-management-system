namespace EcxVisitorManagement.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success") => new() { Success = true, Message = message, Data = data };
    public static ApiResponse<T> Created(T data, string message = "Created successfully") => new() { Success = true, Message = message, Data = data };
    public static ApiResponse<T> NotFound(string message = "Not found") => new() { Success = false, Message = message };
    public static ApiResponse<T> BadRequest(string message) => new() { Success = false, Message = message };
    public static ApiResponse<T> Unauthorized(string message = "Unauthorized") => new() { Success = false, Message = message };
    public static ApiResponse<T> Forbidden(string message = "Forbidden") => new() { Success = false, Message = message };
    public static ApiResponse<T> Error(string message) => new() { Success = false, Message = message };
}

public class PagedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}
