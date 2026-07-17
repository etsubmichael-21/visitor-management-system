using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("visitor_items")]
public class VisitorItem
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("visit_id")]
    public int VisitId { get; set; }

    [Column("item_name")]
    [MaxLength(200)]
    public string ItemName { get; set; } = string.Empty;

    [Column("quantity")]
    public int Quantity { get; set; } = 1;

    [Column("serial_number")]
    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    [Column("brand")]
    [MaxLength(100)]
    public string? Brand { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("is_verified")]
    public bool IsVerified { get; set; }

    [Column("verified_at")]
    public DateTimeOffset? VerifiedAt { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [ForeignKey(nameof(VisitId))]
    public Visit Visit { get; set; } = null!;
}
