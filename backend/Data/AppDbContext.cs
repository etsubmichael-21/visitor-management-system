using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Visitor> Visitors => Set<Visitor>();
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<EmployeeSchedule> EmployeeSchedules => Set<EmployeeSchedule>();
    public DbSet<EmailQueue> EmailQueues => Set<EmailQueue>();
    public DbSet<SmsQueue> SmsQueues => Set<SmsQueue>();
    public DbSet<VisitorItem> VisitorItems => Set<VisitorItem>();
    public DbSet<AppointmentAttachment> AppointmentAttachments => Set<AppointmentAttachment>();
    public DbSet<AppointmentComment> AppointmentComments => Set<AppointmentComment>();
    public DbSet<EmployeeUnavailability> EmployeeUnavailabilities => Set<EmployeeUnavailability>();
    public DbSet<RescheduleRequest> RescheduleRequests => Set<RescheduleRequest>();
    public DbSet<VisitorNotification> VisitorNotifications => Set<VisitorNotification>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.EmployeeId).IsUnique().HasFilter("employee_id IS NOT NULL");
            entity.HasIndex(u => u.VisitorId).IsUnique().HasFilter("visitor_id IS NOT NULL");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.DepartmentId);
            entity.HasIndex(e => e.FullName);
            entity.HasIndex(e => e.UserId).IsUnique().HasFilter("user_id IS NOT NULL");
            entity.HasOne(e => e.Department).WithMany(d => d.Employees).HasForeignKey(e => e.DepartmentId);
            entity.HasOne(e => e.User).WithOne(u => u.Employee).HasForeignKey<Employee>(e => e.UserId);
        });

        modelBuilder.Entity<Visitor>(entity =>
        {
            entity.HasIndex(v => v.Email).IsUnique();
            entity.HasIndex(v => v.NationalId).IsUnique();
            entity.HasIndex(v => v.FullName);
        });

        modelBuilder.Entity<Visit>(entity =>
        {
            entity.HasIndex(v => v.VisitorId);
            entity.HasIndex(v => v.EmployeeId);
            entity.HasIndex(v => v.Status);
            entity.HasIndex(v => v.VisitDate);
            entity.HasIndex(v => v.CheckInTime);
            entity.HasOne(v => v.Visitor).WithMany(vs => vs.Visits).HasForeignKey(v => v.VisitorId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(v => v.Employee).WithMany(e => e.Visits).HasForeignKey(v => v.EmployeeId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(v => v.Appointment).WithMany().HasForeignKey(v => v.AppointmentId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasIndex(a => a.VisitorId);
            entity.HasIndex(a => a.EmployeeId);
            entity.HasIndex(a => a.RequestedDate);
            entity.HasIndex(a => a.Status);
            entity.HasIndex(a => a.AppointmentCode);
            entity.HasOne(a => a.Visitor).WithMany(v => v.Appointments).HasForeignKey(a => a.VisitorId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(a => a.Employee).WithMany(e => e.Appointments).HasForeignKey(a => a.EmployeeId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(a => a.DelegatedToEmployee).WithMany().HasForeignKey(a => a.DelegatedToEmployeeId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(a => a.OriginalEmployee).WithMany().HasForeignKey(a => a.OriginalEmployeeId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(a => a.RedirectDepartment).WithMany().HasForeignKey(a => a.RedirectDepartmentId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasIndex(n => n.EmployeeId);
            entity.HasIndex(n => n.CreatedAt);
            entity.HasOne(n => n.Employee).WithMany(e => e.Notifications).HasForeignKey(n => n.EmployeeId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(n => n.Appointment).WithMany(a => a.Notifications).HasForeignKey(n => n.AppointmentId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(n => n.Visitor).WithMany().HasForeignKey(n => n.VisitorId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasIndex(al => al.UserId);
            entity.HasIndex(al => new { al.EntityName, al.EntityId });
            entity.HasIndex(al => al.CreatedAt);
            entity.HasOne(al => al.User).WithMany(u => u.AuditLogs).HasForeignKey(al => al.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EmployeeSchedule>(entity =>
        {
            entity.HasIndex(es => new { es.EmployeeId, es.DayOfWeek }).IsUnique();
            entity.HasOne(es => es.Employee).WithMany(e => e.Schedules).HasForeignKey(es => es.EmployeeId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VisitorItem>(entity =>
        {
            entity.HasIndex(vi => vi.VisitId);
            entity.HasOne(vi => vi.Visit).WithMany(v => v.VisitorItems).HasForeignKey(vi => vi.VisitId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AppointmentAttachment>(entity =>
        {
            entity.HasIndex(aa => aa.AppointmentId);
            entity.HasOne(aa => aa.Appointment).WithMany(a => a.Attachments).HasForeignKey(aa => aa.AppointmentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(aa => aa.UploadedByUser).WithMany().HasForeignKey(aa => aa.UploadedBy).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AppointmentComment>(entity =>
        {
            entity.HasIndex(ac => ac.AppointmentId);
            entity.HasOne(ac => ac.Appointment).WithMany(a => a.Comments).HasForeignKey(ac => ac.AppointmentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ac => ac.User).WithMany(u => u.AppointmentComments).HasForeignKey(ac => ac.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EmployeeUnavailability>(entity =>
        {
            entity.HasIndex(eu => eu.EmployeeId);
            entity.HasOne(eu => eu.Employee).WithMany(e => e.Unavailabilities).HasForeignKey(eu => eu.EmployeeId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(eu => eu.Creator).WithMany().HasForeignKey(eu => eu.CreatedBy).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RescheduleRequest>(entity =>
        {
            entity.HasIndex(rr => rr.AppointmentId);
            entity.HasOne(rr => rr.Appointment).WithMany(a => a.RescheduleRequests).HasForeignKey(rr => rr.AppointmentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(rr => rr.RequestedByUser).WithMany().HasForeignKey(rr => rr.RequestedByUserId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(rr => rr.RespondedByUser).WithMany().HasForeignKey(rr => rr.RespondedByUserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<VisitorNotification>(entity =>
        {
            entity.HasIndex(vn => vn.VisitorId);
            entity.HasOne(vn => vn.Visitor).WithMany().HasForeignKey(vn => vn.VisitorId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(vn => vn.Appointment).WithMany().HasForeignKey(vn => vn.AppointmentId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();
            entity.HasOne(rt => rt.User).WithMany(u => u.RefreshTokens).HasForeignKey(rt => rt.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasIndex(prt => prt.Token).IsUnique();
        });
    }
}
