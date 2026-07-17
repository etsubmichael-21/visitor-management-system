using AutoMapper;
using EcxVisitorManagement.DTOs.Appointments;
using EcxVisitorManagement.DTOs.Departments;
using EcxVisitorManagement.DTOs.Employees;
using EcxVisitorManagement.DTOs.Notifications;
using EcxVisitorManagement.DTOs.Users;
using EcxVisitorManagement.DTOs.Visitors;
using EcxVisitorManagement.DTOs.Visits;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Visitor, VisitorResponseDto>()
            .ForMember(d => d.TotalVisits, o => o.MapFrom(s => s.Visits.Count))
            .ForMember(d => d.TotalAppointments, o => o.MapFrom(s => s.Appointments.Count));

        CreateMap<Visit, VisitResponseDto>()
            .ForMember(d => d.VisitorName, o => o.MapFrom(s => s.Visitor.FullName))
            .ForMember(d => d.VisitorPhone, o => o.MapFrom(s => s.Visitor.Phone))
            .ForMember(d => d.VisitorEmail, o => o.MapFrom(s => s.Visitor.Email))
            .ForMember(d => d.VisitorPhotoUrl, o => o.MapFrom(s => s.Visitor.PhotoUrl))
            .ForMember(d => d.EmployeeName, o => o.MapFrom(s => s.Employee.FullName))
            .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Employee.Department.Name))
            .ForMember(d => d.VisitorItems, o => o.MapFrom(s => s.VisitorItems))
            .ForMember(d => d.AllItemsVerified, o => o.MapFrom(s => s.VisitorItems.Any() && s.VisitorItems.All(i => i.IsVerified)));

        CreateMap<VisitorItem, VisitorItemDto>();

        CreateMap<Appointment, AppointmentResponseDto>()
            .ForMember(d => d.VisitorName, o => o.MapFrom(s => s.Visitor.FullName))
            .ForMember(d => d.VisitorEmail, o => o.MapFrom(s => s.Visitor.Email))
            .ForMember(d => d.VisitorPhone, o => o.MapFrom(s => s.Visitor.Phone))
            .ForMember(d => d.EmployeeName, o => o.MapFrom(s => s.Employee.FullName))
            .ForMember(d => d.EmployeePosition, o => o.MapFrom(s => s.Employee.Position))
            .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Employee.Department.Name))
            .ForMember(d => d.DelegatedToEmployeeName, o => o.MapFrom(s => s.DelegatedToEmployee != null ? s.DelegatedToEmployee.FullName : null))
            .ForMember(d => d.OriginalEmployeeName, o => o.MapFrom(s => s.OriginalEmployee != null ? s.OriginalEmployee.FullName : null))
            .ForMember(d => d.Attachments, o => o.MapFrom(s => s.Attachments))
            .ForMember(d => d.CommentCount, o => o.MapFrom(s => s.Comments.Count));

        CreateMap<AppointmentAttachment, AppointmentAttachmentDto>();
        CreateMap<AppointmentComment, AppointmentCommentDto>()
            .ForMember(d => d.UserName, o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.UserRole, o => o.MapFrom(s => s.User.Role));

        CreateMap<Employee, EmployeeResponseDto>()
            .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Department.Name));

        CreateMap<Department, DepartmentResponseDto>()
            .ForMember(d => d.EmployeeCount, o => o.MapFrom(s => s.Employees.Count));

        CreateMap<User, UserResponseDto>()
            .ForMember(d => d.EmployeeName, o => o.MapFrom(s => s.Employee != null ? s.Employee.FullName : null))
            .ForMember(d => d.VisitorName, o => o.MapFrom(s => s.Visitor != null ? s.Visitor.FullName : null));

        CreateMap<Notification, NotificationResponseDto>();
        CreateMap<VisitorNotification, VisitorNotificationResponseDto>();
        CreateMap<RescheduleRequest, RescheduleResponseDto>()
            .ForMember(d => d.RequestedByUserName, o => o.MapFrom(s => s.RequestedByUser.FullName));
    }
}
