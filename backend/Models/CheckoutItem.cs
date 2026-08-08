using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("checkout_items")]
public class CheckoutItem
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("visit_id")]
    public int VisitId { get; set; }

    [Column("appointment_property_id")]
    public int? AppointmentPropertyId { get; set; }

    [Column("item_name")]
    [MaxLength(255)]
    public string ItemName { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; } = 1;

    [Column("return_status")]
    [MaxLength(30)]
    public string ReturnStatus { get; set; } = "Returned";

    [Column("remarks")]
    public string? Remarks { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [ForeignKey(nameof(VisitId))]
    public Visit Visit { get; set; } = null!;

    [ForeignKey(nameof(AppointmentPropertyId))]
    public AppointmentProperty? AppointmentProperty { get; set; }
}
