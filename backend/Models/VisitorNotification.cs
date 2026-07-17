using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("visitor_notifications")]
public class VisitorNotification
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("visitor_id")]
    public int VisitorId { get; set; }

    [Column("appointment_id")]
    public int? AppointmentId { get; set; }

    [Column("title")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [Column("notification_type")]
    [MaxLength(20)]
    public string NotificationType { get; set; } = "Info";

    [Column("is_read")]
    public bool IsRead { get; set; }

    [Column("read_at")]
    public DateTimeOffset? ReadAt { get; set; }

    [Column("channel")]
    [MaxLength(10)]
    public string Channel { get; set; } = "InApp";

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey(nameof(VisitorId))]
    public Visitor Visitor { get; set; } = null!;

    [ForeignKey(nameof(AppointmentId))]
    public Appointment? Appointment { get; set; }
}
