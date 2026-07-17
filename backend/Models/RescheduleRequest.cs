using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("reschedule_requests")]
public class RescheduleRequest
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("appointment_id")]
    public int AppointmentId { get; set; }

    [Column("requested_by_user_id")]
    public int RequestedByUserId { get; set; }

    [Column("new_date")]
    public DateOnly NewDate { get; set; }

    [Column("new_start_time")]
    public DateTimeOffset NewStartTime { get; set; }

    [Column("new_end_time")]
    public DateTimeOffset NewEndTime { get; set; }

    [Column("reason")]
    public string? Reason { get; set; }

    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [Column("responded_by_user_id")]
    public int? RespondedByUserId { get; set; }

    [Column("responded_at")]
    public DateTimeOffset? RespondedAt { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey(nameof(AppointmentId))]
    public Appointment Appointment { get; set; } = null!;

    [ForeignKey(nameof(RequestedByUserId))]
    public User RequestedByUser { get; set; } = null!;

    [ForeignKey(nameof(RespondedByUserId))]
    public User? RespondedByUser { get; set; }
}
