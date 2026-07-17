using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("password_reset_tokens")]
public class PasswordResetToken
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("email")]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Column("token")]
    [MaxLength(500)]
    public string Token { get; set; } = string.Empty;

    [Column("expires_at")]
    public DateTimeOffset ExpiresAt { get; set; }

    [Column("is_used")]
    public bool IsUsed { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
