using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("refresh_tokens")]
public class RefreshToken
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("token")]
    [MaxLength(500)]
    public string Token { get; set; } = string.Empty;

    [Column("expires_at")]
    public DateTimeOffset ExpiresAt { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("is_revoked")]
    public bool IsRevoked { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
