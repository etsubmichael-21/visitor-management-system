using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("appointment_attachments")]
public class AppointmentAttachment
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("appointment_id")]
    public int AppointmentId { get; set; }

    [Column("file_name")]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Column("file_path")]
    public string FilePath { get; set; } = string.Empty;

    [Column("file_size")]
    public int FileSize { get; set; }

    [Column("content_type")]
    [MaxLength(100)]
    public string ContentType { get; set; } = string.Empty;

    [Column("uploaded_by")]
    public int UploadedBy { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey(nameof(AppointmentId))]
    public Appointment Appointment { get; set; } = null!;

    [ForeignKey(nameof(UploadedBy))]
    public User UploadedByUser { get; set; } = null!;
}
