using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("employees")]
public class Employee
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

    [Column("department_id")]
    public int DepartmentId { get; set; }

    [Column("position")]
    [MaxLength(100)]
    public string Position { get; set; } = string.Empty;

    [Column("office_number")]
    [MaxLength(20)]
    public string? OfficeNumber { get; set; }

    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "Active";

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [ForeignKey(nameof(DepartmentId))]
    public Department Department { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<EmployeeSchedule> Schedules { get; set; } = new List<EmployeeSchedule>();
    public ICollection<EmployeeUnavailability> Unavailabilities { get; set; } = new List<EmployeeUnavailability>();
}
