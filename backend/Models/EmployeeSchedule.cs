using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcxVisitorManagement.Models;

[Table("employee_schedules")]
public class EmployeeSchedule
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("day_of_week")]
    [MaxLength(9)]
    public string DayOfWeek { get; set; } = string.Empty;

    [Column("start_time")]
    public TimeOnly StartTime { get; set; }

    [Column("end_time")]
    public TimeOnly EndTime { get; set; }

    [Column("break_start")]
    public TimeOnly? BreakStart { get; set; }

    [Column("break_end")]
    public TimeOnly? BreakEnd { get; set; }

    [Column("is_available")]
    public bool IsAvailable { get; set; } = true;

    [Column("max_appointments")]
    public int MaxAppointments { get; set; } = 10;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee Employee { get; set; } = null!;
}
