namespace EcxVisitorManagement.DTOs.Common;

public class PageRequest
{
    private int _pageSize = 10;
    public int Page { get; set; } = 1;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, 100);
    }
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public bool SortDesc { get; set; }
}
