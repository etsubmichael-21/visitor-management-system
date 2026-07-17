using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("full_name")]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Column("email")]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Column("password_hash")]
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("role")]
    [MaxLength(50)]
    public string Role { get; set; } = "Visitor";

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("last_login")]
    public DateTimeOffset? LastLogin { get; set; }

    [Column("employee_id")]
    public int? EmployeeId { get; set; }

    [Column("visitor_id")]
    public int? VisitorId { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }

    [ForeignKey(nameof(VisitorId))]
    public Visitor? Visitor { get; set; }

    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<AppointmentComment> AppointmentComments { get; set; } = new List<AppointmentComment>();
}
