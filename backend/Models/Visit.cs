using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("visits")]
public class Visit
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("visitor_id")]
    public int VisitorId { get; set; }

    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("appointment_id")]
    public int? AppointmentId { get; set; }

    [Column("purpose")]
    [MaxLength(500)]
    public string Purpose { get; set; } = string.Empty;

    [Column("visit_date")]
    public DateOnly VisitDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    [Column("check_in_time")]
    public DateTimeOffset? CheckInTime { get; set; }

    [Column("check_out_time")]
    public DateTimeOffset? CheckOutTime { get; set; }

    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "Scheduled";

    [Column("badge_number")]
    [MaxLength(50)]
    public string? BadgeNumber { get; set; }

    [Column("security_officer")]
    [MaxLength(100)]
    public string? SecurityOfficer { get; set; }

    [Column("remark")]
    public string? Remark { get; set; }

    [Column("is_destination_known")]
    public bool IsDestinationKnown { get; set; } = true;

    [Column("redirect_note")]
    public string? RedirectNote { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [ForeignKey(nameof(VisitorId))]
    public Visitor Visitor { get; set; } = null!;

    [ForeignKey(nameof(EmployeeId))]
    public Employee Employee { get; set; } = null!;

    [ForeignKey(nameof(AppointmentId))]
    public Appointment? Appointment { get; set; }

    public ICollection<VisitorItem> VisitorItems { get; set; } = new List<VisitorItem>();

    public ICollection<CheckoutItem> CheckoutItems { get; set; } = new List<CheckoutItem>();
}
