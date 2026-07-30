using EcxVisitorManagement.DTOs.Appointments;
using EcxVisitorManagement.DTOs.Common;

namespace EcxVisitorManagement.Interfaces;

public interface IAppointmentService
{
    Task<PagedResponse<AppointmentResponseDto>> GetAllAsync(PageRequest request);
    Task<PagedResponse<AppointmentResponseDto>> GetAllByEmployeeAsync(int employeeId, PageRequest request);
    Task<PagedResponse<AppointmentResponseDto>> GetAllByVisitorAsync(int visitorId, PageRequest request);
    Task<AppointmentResponseDto?> GetByIdAsync(int id);
    Task<AppointmentResponseDto> CreateAsync(AppointmentCreateDto dto);
    Task<AppointmentResponseDto> ApproveAsync(int id, int userId);
    Task<AppointmentResponseDto> RejectAsync(int id, AppointmentRejectDto dto, int userId);
    Task<AppointmentResponseDto> CancelAsync(int id, int userId);
    Task<AppointmentResponseDto> CompleteAsync(int id, int userId);
    Task<AppointmentResponseDto> DelegateAsync(int id, AppointmentDelegateDto dto, int userId);
    Task<AppointmentResponseDto> RedirectAsync(int id, AppointmentRedirectDto dto, int userId);
    Task<AppointmentResponseDto> ToggleConfidentialAsync(int id);
    Task<IReadOnlyList<AppointmentResponseDto>> GetByVisitorAsync(int visitorId);
    Task<IReadOnlyList<AppointmentResponseDto>> GetByEmployeeAsync(int employeeId);
    Task<IReadOnlyList<AppointmentResponseDto>> GetPendingAsync();
    Task<IReadOnlyList<AppointmentResponseDto>> GetPendingByEmployeeAsync(int employeeId);
    Task<IReadOnlyList<AppointmentResponseDto>> GetTodayByEmployeeAsync(int employeeId);
    Task<IReadOnlyList<AppointmentResponseDto>> GetTodayAsync();
    Task<IReadOnlyList<AppointmentResponseDto>> GetByDepartmentAsync(int departmentId);
    Task<IReadOnlyList<AppointmentResponseDto>> GetConfidentialAsync();
    Task<RescheduleResponseDto> RequestRescheduleAsync(int appointmentId, RescheduleRequestDto dto, int userId);
    Task<RescheduleResponseDto> ApproveRescheduleAsync(int appointmentId, int requestId, int userId);
    Task<RescheduleResponseDto> RejectRescheduleAsync(int appointmentId, int requestId, int userId);
    Task<List<AppointmentAttachmentDto>> GetAttachmentsAsync(int appointmentId);
    Task<AppointmentAttachmentDto> UploadAttachmentAsync(int appointmentId, string fileName, string filePath, int fileSize, string contentType, int userId);
    Task DeleteAttachmentAsync(int appointmentId, int attachmentId);
    Task<List<AppointmentCommentDto>> GetCommentsAsync(int appointmentId);
    Task<AppointmentCommentDto> AddCommentAsync(int appointmentId, AppointmentCommentCreateDto dto, int userId);
    Task HandleEmployeeUnavailabilityAsync(int employeeId, string type, DateOnly startDate, DateOnly? endDate, string? reason, int createdByUserId);
}
