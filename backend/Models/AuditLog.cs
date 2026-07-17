using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("audit_logs")]
public class AuditLog
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("action")]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [Column("entity_name")]
    [MaxLength(100)]
    public string EntityName { get; set; } = string.Empty;

    [Column("entity_id")]
    public int EntityId { get; set; }

    [Column("old_values")]
    public string? OldValues { get; set; }

    [Column("new_values")]
    public string? NewValues { get; set; }

    [Column("ip_address")]
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [Column("user_agent")]
    public string? UserAgent { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
