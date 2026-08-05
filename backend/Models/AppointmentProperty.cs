using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("appointment_properties")]
public class AppointmentProperty
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("appointment_id")]
    public int AppointmentId { get; set; }

    [Column("property_name")]
    [MaxLength(255)]
    public string PropertyName { get; set; } = string.Empty;

    [Column("property_type")]
    [MaxLength(100)]
    public string PropertyType { get; set; } = string.Empty;

    [Column("brand")]
    [MaxLength(100)]
    public string? Brand { get; set; }

    [Column("model")]
    [MaxLength(100)]
    public string? Model { get; set; }

    [Column("serial_number")]
    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    [Column("asset_tag_number")]
    [MaxLength(100)]
    public string? AssetTagNumber { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; } = 1;

    [Column("description")]
    public string? Description { get; set; }

    [Column("is_verified")]
    public bool IsVerified { get; set; }

    [Column("verification_status")]
    [MaxLength(50)]
    public string? VerificationStatus { get; set; }

    [Column("verified_at")]
    public DateTimeOffset? VerifiedAt { get; set; }

    [Column("verified_by_user_id")]
    public int? VerifiedByUserId { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [ForeignKey(nameof(AppointmentId))]
    public Appointment Appointment { get; set; } = null!;

    [ForeignKey(nameof(VerifiedByUserId))]
    public User? VerifiedByUser { get; set; }
}
