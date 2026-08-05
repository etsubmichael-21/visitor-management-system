using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("appointments")]
public class Appointment
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("visitor_id")]
    public int VisitorId { get; set; }

    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("requested_date")]
    public DateOnly RequestedDate { get; set; }

    [Column("requested_start_time")]
    public DateTimeOffset RequestedStartTime { get; set; }

    [Column("requested_end_time")]
    public DateTimeOffset RequestedEndTime { get; set; }

    [Column("purpose")]
    [MaxLength(500)]
    public string Purpose { get; set; } = string.Empty;

    [Column("status")]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending";

    [Column("employee_response")]
    public DateTimeOffset? EmployeeResponse { get; set; }

    [Column("approval_date")]
    public DateTimeOffset? ApprovalDate { get; set; }

    [Column("reminder_email_sent")]
    public bool ReminderEmailSent { get; set; }

    [Column("reminder_sms_sent")]
    public bool ReminderSmsSent { get; set; }

    [Column("visitor_confirmed")]
    public bool VisitorConfirmed { get; set; }

    [Column("check_in_allowed")]
    public bool CheckInAllowed { get; set; }

    [Column("appointment_code")]
    [MaxLength(20)]
    public string? AppointmentCode { get; set; }

    [Column("is_confidential")]
    public bool IsConfidential { get; set; }

    [Column("route_type")]
    [MaxLength(30)]
    public string? RouteType { get; set; }

    [Column("appointment_method")]
    [MaxLength(30)]
    public string? AppointmentMethod { get; set; }

    [Column("delegated_to_employee_id")]
    public int? DelegatedToEmployeeId { get; set; }

    [Column("original_employee_id")]
    public int? OriginalEmployeeId { get; set; }

    [Column("redirect_department_id")]
    public int? RedirectDepartmentId { get; set; }

    [Column("assigned_department_id")]
    public int? AssignedDepartmentId { get; set; }

    [Column("assigned_employee_id")]
    public int? AssignedEmployeeId { get; set; }

    [Column("redirected_from_department_id")]
    public int? RedirectedFromDepartmentId { get; set; }

    [Column("redirect_reason")]
    public string? RedirectReason { get; set; }

    [Column("assigned_by")]
    public int? AssignedBy { get; set; }

    [Column("assigned_at")]
    public DateTimeOffset? AssignedAt { get; set; }

    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("attachment_file_name")]
    [MaxLength(255)]
    public string? AttachmentFileName { get; set; }

    [Column("attachment_original_name")]
    [MaxLength(255)]
    public string? AttachmentOriginalFileName { get; set; }

    [Column("attachment_path")]
    [MaxLength(500)]
    public string? AttachmentPath { get; set; }

    [Column("attachment_size")]
    public long? AttachmentSize { get; set; }

    [Column("attachment_content_type")]
    [MaxLength(120)]
    public string? AttachmentContentType { get; set; }

    [Column("attachment_uploaded_at")]
    public DateTimeOffset? AttachmentUploadedAt { get; set; }

    [Column("property_letter_file_name")]
    [MaxLength(255)]
    public string? PropertyLetterFileName { get; set; }

    [Column("property_letter_original_name")]
    [MaxLength(255)]
    public string? PropertyLetterOriginalFileName { get; set; }

    [Column("property_letter_path")]
    [MaxLength(500)]
    public string? PropertyLetterPath { get; set; }

    [Column("property_letter_size")]
    public long? PropertyLetterSize { get; set; }

    [Column("property_letter_content_type")]
    [MaxLength(120)]
    public string? PropertyLetterContentType { get; set; }

    [Column("property_letter_uploaded_at")]
    public DateTimeOffset? PropertyLetterUploadedAt { get; set; }

    [Column("has_properties")]
    public bool HasProperties { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [ForeignKey(nameof(VisitorId))]
    public Visitor Visitor { get; set; } = null!;

    [ForeignKey(nameof(EmployeeId))]
    public Employee Employee { get; set; } = null!;

    [ForeignKey(nameof(DelegatedToEmployeeId))]
    public Employee? DelegatedToEmployee { get; set; }

    [ForeignKey(nameof(OriginalEmployeeId))]
    public Employee? OriginalEmployee { get; set; }

    [ForeignKey(nameof(RedirectDepartmentId))]
    public Department? RedirectDepartment { get; set; }

    [ForeignKey(nameof(AssignedDepartmentId))]
    public Department? AssignedDepartment { get; set; }

    [ForeignKey(nameof(AssignedEmployeeId))]
    public Employee? AssignedEmployee { get; set; }

    [ForeignKey(nameof(RedirectedFromDepartmentId))]
    public Department? RedirectedFromDepartment { get; set; }

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<AppointmentAttachment> Attachments { get; set; } = new List<AppointmentAttachment>();
    public ICollection<AppointmentComment> Comments { get; set; } = new List<AppointmentComment>();
    public ICollection<RescheduleRequest> RescheduleRequests { get; set; } = new List<RescheduleRequest>();
    public ICollection<AppointmentProperty> Properties { get; set; } = new List<AppointmentProperty>();
    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
