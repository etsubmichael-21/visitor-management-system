using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("email_queue")]
public class EmailQueue
{
    public const string StatusPending = "Pending";
    public const string StatusSent = "Sent";
    public const string StatusFailed = "Failed";
    public const string StatusPermanentlyFailed = "PermanentlyFailed";
    public const int MaxRetryCount = 3;

    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("appointment_id")]
    public int? AppointmentId { get; set; }

    [Column("recipient_email")]
    [MaxLength(255)]
    public string RecipientEmail { get; set; } = string.Empty;

    [Column("subject")]
    [MaxLength(255)]
    public string Subject { get; set; } = string.Empty;

    [Column("body")]
    public string Body { get; set; } = string.Empty;

    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = StatusPending;

    [Column("retry_count")]
    public int RetryCount { get; set; }

    [Column("sent_at")]
    public DateTimeOffset? SentAt { get; set; }

    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
