using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("visitors")]
public class Visitor
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("full_name")]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Column("phone")]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Column("email")]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Column("address")]
    public string Address { get; set; } = string.Empty;

    [Column("national_id")]
    [MaxLength(50)]
    public string? NationalId { get; set; }

    [Column("organization")]
    [MaxLength(100)]
    public string? Organization { get; set; }

    [Column("gender")]
    [MaxLength(10)]
    public string? Gender { get; set; }

    [Column("photo_url")]
    public string? PhotoUrl { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
