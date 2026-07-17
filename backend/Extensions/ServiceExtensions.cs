using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Repositories.Implementation;
using EcxVisitorManagement.Services.Implementation;

namespace EcxVisitorManagement.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection RegisterServices(this IServiceCollection services)
    {
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IVisitorRepository, VisitorRepository>();
        services.AddScoped<IVisitRepository, VisitRepository>();
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IVisitorNotificationRepository, VisitorNotificationRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IVisitorService, VisitorService>();
        services.AddScoped<IVisitService, VisitService>();
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<Interfaces.IEmailService, Services.Implementation.EmailNotificationService>();
        services.AddScoped<Interfaces.ISmsService, Services.Implementation.SmsNotificationService>();

        return services;
    }
}
