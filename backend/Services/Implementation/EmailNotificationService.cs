using System.Net;
using System.Text;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class EmailNotificationService : Interfaces.IEmailService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailNotificationService> _logger;

    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly bool _smtpEnableSsl;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromAddress;
    private readonly string _fromName;
    private readonly string _baseUrl;
    private readonly string _supportEmail;
    private readonly string _companyName;
    private readonly string _companyPhone;
    private readonly string _companyAddress;

    public EmailNotificationService(
        AppDbContext context,
        IConfiguration configuration,
        ILogger<EmailNotificationService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;

        _smtpHost = configuration["Smtp:Host"] ?? "smtp.gmail.com";
        _smtpPort = int.TryParse(configuration["Smtp:Port"], out var port) ? port : 587;
        _smtpEnableSsl = bool.TryParse(configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;
        _smtpUsername = configuration["Smtp:Username"] ?? "";
        _smtpPassword = configuration["Smtp:Password"] ?? "";
        _fromAddress = configuration["Smtp:FromAddress"] ?? "noreply@ecx.com.et";
        _fromName = configuration["Smtp:FromName"] ?? "ECX Visitor Management";
        _baseUrl = configuration["Email:BaseUrl"] ?? "https://visitor.ecx.com.et";
        _supportEmail = configuration["Email:SupportEmail"] ?? "support@ecx.com.et";
        _companyName = configuration["Email:CompanyName"] ?? "Ethiopia Commodity Exchange";
        _companyPhone = configuration["Email:CompanyPhone"] ?? "+251-11-123-4567";
        _companyAddress = configuration["Email:CompanyAddress"] ?? "Addis Ababa, Ethiopia";
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var fullHtml = WrapInBaseTemplate(subject, htmlBody);

        var queue = new EmailQueue
        {
            RecipientEmail = toEmail,
            Subject = subject,
            Body = fullHtml,
            Status = "Pending",
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.EmailQueues.Add(queue);
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Email queued for {Email}: {Subject}", toEmail, subject);
    }

    public async Task SendAppointmentSubmittedAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? notes, CancellationToken ct = default)
    {
        var subject = "Appointment Request Received";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#F4B223; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">REQUEST SUBMITTED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(visitorName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">Your appointment request has been successfully submitted and is awaiting approval from your host. You will receive another email once the appointment is approved or rejected.</p>
            {BuildAppointmentDetailsTable(employeeName, department, date, startTime, endTime, purpose, notes, "Pending")}
            <div style=""background:#F0F7F1; border-left:4px solid #0F6A38; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#0C5830;""><strong>What happens next?</strong></p>
                <p style=""margin:6px 0 0; font-size:13px; color:#555;"">Your host will review and respond to your request. You will be notified via email once a decision is made.</p>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendAppointmentApprovedAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? notes, CancellationToken ct = default)
    {
        var subject = "Appointment Approved";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#0F6A38; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">APPROVED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(visitorName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">Great news! Your appointment has been <strong style=""color:#0F6A38;"">approved</strong> by <strong>{EscapeHtml(employeeName)}</strong>. Please arrive on time for your scheduled visit.</p>
            {BuildAppointmentDetailsTable(employeeName, department, date, startTime, endTime, purpose, notes, "Approved")}
            <div style=""background:#F0F7F1; border-left:4px solid #0F6A38; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#0C5830;""><strong>Reminder:</strong> Please bring a valid photo ID for verification at the reception desk.</p>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendAppointmentRejectedAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? rejectionReason, CancellationToken ct = default)
    {
        var subject = "Appointment Rejected";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#c62828; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">REJECTED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(visitorName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">We regret to inform you that your appointment request has been <strong style=""color:#c62828;"">rejected</strong> by <strong>{EscapeHtml(employeeName)}</strong>.</p>
            {BuildAppointmentDetailsTable(employeeName, department, date, startTime, endTime, purpose, null, "Rejected")}
            {(string.IsNullOrWhiteSpace(rejectionReason) ? "" : $@"
            <div style=""background:#FFF3E0; border-left:4px solid #f57f17; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#e65100;""><strong>Reason:</strong></p>
                <p style=""margin:6px 0 0; font-size:13px; color:#555;"">{EscapeHtml(rejectionReason)}</p>
            </div>")}
            <div style=""background:#F0F7F1; border-left:4px solid #0F6A38; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#0C5830;"">You may submit a new appointment request at any time.</p>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendAppointmentCancelledAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, CancellationToken ct = default)
    {
        var subject = "Appointment Cancelled";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#f57f17; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">CANCELLED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(visitorName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">Your appointment with <strong>{EscapeHtml(employeeName)}</strong> has been <strong style=""color:#f57f17;"">cancelled</strong>.</p>
            {BuildAppointmentDetailsTable(employeeName, department, date, startTime, endTime, purpose, null, "Cancelled")}
            <div style=""background:#F0F7F1; border-left:4px solid #0F6A38; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#0C5830;"">If this was a mistake, you may submit a new appointment request at any time.</p>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendAppointmentRescheduledAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly oldDate, DateOnly newDate, DateTimeOffset newStartTime, DateTimeOffset newEndTime, string purpose, string? reason, CancellationToken ct = default)
    {
        var subject = "Appointment Rescheduled";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#1565c0; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">RESCHEDULED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(visitorName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">Your appointment with <strong>{EscapeHtml(employeeName)}</strong> has been <strong style=""color:#1565c0;"">rescheduled</strong>.</p>
            <div style=""background:#FFF3E0; border:1px solid #FFE0B2; border-radius:8px; padding:16px; margin-bottom:24px;"">
                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""font-size:14px; color:#333;"">
                    <tr><td style=""padding:6px 0; color:#888; width:140px;"">Previous Date</td><td style=""padding:6px 0; text-decoration:line-through; color:#999;"">{oldDate:MMMM dd, yyyy}</td></tr>
                    <tr><td style=""padding:6px 0; color:#888;"">New Date</td><td style=""padding:6px 0; font-weight:600; color:#0F6A38;"">{newDate:MMMM dd, yyyy}</td></tr>
                    <tr><td style=""padding:6px 0; color:#888;"">New Time</td><td style=""padding:6px 0; font-weight:600; color:#0F6A38;"">{newStartTime:h:mm tt} - {newEndTime:h:mm tt}</td></tr>
                </table>
            </div>
            {BuildAppointmentDetailsTable(employeeName, department, newDate, newStartTime, newEndTime, purpose, null, "Approved")}
            {(string.IsNullOrWhiteSpace(reason) ? "" : $@"
            <div style=""background:#E3F2FD; border-left:4px solid #1565c0; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#1565c0;""><strong>Reason for reschedule:</strong></p>
                <p style=""margin:6px 0 0; font-size:13px; color:#555;"">{EscapeHtml(reason)}</p>
            </div>")}";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendAppointmentReminderAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, CancellationToken ct = default)
    {
        var subject = $"Reminder: Appointment Tomorrow - {purpose}";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#F4B223; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">REMINDER</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(visitorName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">This is a friendly reminder that you have an appointment <strong>tomorrow</strong>.</p>
            {BuildAppointmentDetailsTable(employeeName, department, date, startTime, endTime, purpose, null, "Approved")}
            <div style=""background:#FFF3E0; border-left:4px solid #F4B223; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#e65100;""><strong>Please remember:</strong></p>
                <ul style=""margin:8px 0 0; padding-left:20px; font-size:13px; color:#555;"">
                    <li>Bring a valid photo ID</li>
                    <li>Arrive 10-15 minutes early</li>
                    <li>Check in at the reception desk</li>
                </ul>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string fullName, CancellationToken ct = default)
    {
        var subject = "Welcome to ECX Visitor Management";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#0F6A38; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">WELCOME</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(fullName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">Welcome to the ECX Visitor Management System! Your account has been successfully created. You can now use the portal to:</p>
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-bottom:24px;"">
                <tr>
                    <td style=""padding:10px 0; vertical-align:top; width:30px;"">
                        <div style=""width:24px; height:24px; background:#F0F7F1; border-radius:50%; text-align:center; line-height:24px; color:#0F6A38; font-size:12px;"">&#10003;</div>
                    </td>
                    <td style=""padding:10px 0; font-size:14px; color:#555;"">Book and manage appointments with ECX employees</td>
                </tr>
                <tr>
                    <td style=""padding:10px 0; vertical-align:top; width:30px;"">
                        <div style=""width:24px; height:24px; background:#F0F7F1; border-radius:50%; text-align:center; line-height:24px; color:#0F6A38; font-size:12px;"">&#10003;</div>
                    </td>
                    <td style=""padding:10px 0; font-size:14px; color:#555;"">Receive real-time notifications about your appointments</td>
                </tr>
                <tr>
                    <td style=""padding:10px 0; vertical-align:top; width:30px;"">
                        <div style=""width:24px; height:24px; background:#F0F7F1; border-radius:50%; text-align:center; line-height:24px; color:#0F6A38; font-size:12px;"">&#10003;</div>
                    </td>
                    <td style=""padding:10px 0; font-size:14px; color:#555;"">View your visit history and appointment status</td>
                </tr>
            </table>
            <div style=""text-align:center; margin:24px 0;"">
                <a href=""{_baseUrl}/auth/login"" style=""display:inline-block; background:#0F6A38; color:white; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;"">Log In to Your Account</a>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendPasswordChangedEmailAsync(string toEmail, string fullName, CancellationToken ct = default)
    {
        var subject = "Your Password Has Been Changed";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#0F6A38; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">PASSWORD CHANGED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(fullName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">Your password has been successfully changed. If you made this change, no further action is needed.</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">If you did <strong>not</strong> make this change, please contact our support team immediately to secure your account.</p>
            <div style=""text-align:center; margin:24px 0;"">
                <a href=""{_baseUrl}/auth/login"" style=""display:inline-block; background:#0F6A38; color:white; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;"">Go to Login</a>
            </div>
            <div style=""background:#FFF3E0; border-left:4px solid #F4B223; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#e65100;""><strong>Need help?</strong></p>
                <p style=""margin:6px 0 0; font-size:13px; color:#555;"">Contact support at <a href=""mailto:{_supportEmail}"" style=""color:#0F6A38;"">{_supportEmail}</a> or call {_companyPhone}.</p>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendEmployeeWelcomeEmailAsync(string toEmail, string employeeName, CancellationToken ct = default)
    {
        var subject = "Welcome to ECX — Employee Account Created";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#0F6A38; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">ACCOUNT CREATED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(employeeName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">Welcome to the ECX Employee Management Portal! Your employee account has been created. You can now manage appointments, view schedules, and communicate with visitors.</p>
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-bottom:24px;"">
                <tr>
                    <td style=""padding:10px 0; vertical-align:top; width:30px;"">
                        <div style=""width:24px; height:24px; background:#F0F7F1; border-radius:50%; text-align:center; line-height:24px; color:#0F6A38; font-size:12px;"">&#10003;</div>
                    </td>
                    <td style=""padding:10px 0; font-size:14px; color:#555;"">Approve, reject, or reschedule appointment requests</td>
                </tr>
                <tr>
                    <td style=""padding:10px 0; vertical-align:top; width:30px;"">
                        <div style=""width:24px; height:24px; background:#F0F7F1; border-radius:50%; text-align:center; line-height:24px; color:#0F6A38; font-size:12px;"">&#10003;</div>
                    </td>
                    <td style=""padding:10px 0; font-size:14px; color:#555;"">Receive notifications for new and upcoming appointments</td>
                </tr>
                <tr>
                    <td style=""padding:10px 0; vertical-align:top; width:30px;"">
                        <div style=""width:24px; height:24px; background:#F0F7F1; border-radius:50%; text-align:center; line-height:24px; color:#0F6A38; font-size:12px;"">&#10003;</div>
                    </td>
                    <td style=""padding:10px 0; font-size:14px; color:#555;"">Manage your schedule and availability</td>
                </tr>
            </table>
            <div style=""text-align:center; margin:24px 0;"">
                <a href=""{_baseUrl}/employee/login"" style=""display:inline-block; background:#0F6A38; color:white; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;"">Log In to Employee Portal</a>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string baseUrl, CancellationToken ct = default)
    {
        var resetUrl = $"{baseUrl}/auth/reset-password?token={Uri.EscapeDataString(resetToken)}";
        var subject = "Password Reset Request";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#c62828; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">PASSWORD RESET</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">We received a request to reset your password. Click the button below to set a new password:</p>
            <div style=""text-align:center; margin:24px 0;"">
                <a href=""{resetUrl}"" style=""display:inline-block; background:#c62828; color:white; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;"">Reset Password</a>
            </div>
            <p style=""font-size:13px; color:#999; line-height:1.6; margin-bottom:16px;"">This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <div style=""background:#F5F5F5; border-radius:8px; padding:14px 18px; margin-top:16px;"">
                <p style=""margin:0; font-size:12px; color:#999;"">If the button above does not work, copy and paste this URL into your browser:</p>
                <p style=""margin:6px 0 0; font-size:12px; color:#1565c0; word-break:break-all;"">{resetUrl}</p>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendEmployeeNewRequestAsync(string toEmail, string employeeName, string visitorName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? notes, CancellationToken ct = default)
    {
        var subject = $"New Appointment Request from {visitorName}";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#1565c0; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">NEW REQUEST</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(employeeName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">You have received a new appointment request from <strong>{EscapeHtml(visitorName)}</strong>. Please review and respond at your earliest convenience.</p>
            {BuildEmployeeDetailsTable(visitorName, department, date, startTime, endTime, purpose, notes, "Pending")}
            <div style=""text-align:center; margin:24px 0;"">
                <a href=""{_baseUrl}/appointments"" style=""display:inline-block; background:#0F6A38; color:white; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;"">Review Request</a>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendEmployeeRequestCancelledAsync(string toEmail, string employeeName, string visitorName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, CancellationToken ct = default)
    {
        var subject = $"Appointment Cancelled by {visitorName}";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#f57f17; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">CANCELLED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(employeeName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">The appointment with <strong>{EscapeHtml(visitorName)}</strong> has been <strong style=""color:#f57f17;"">cancelled</strong> by the visitor.</p>
            {BuildEmployeeDetailsTable(visitorName, department, date, startTime, endTime, purpose, null, "Cancelled")}";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendEmployeeRequestRescheduledAsync(string toEmail, string employeeName, string visitorName, string department, DateOnly oldDate, DateOnly newDate, DateTimeOffset newStartTime, DateTimeOffset newEndTime, string purpose, string? reason, CancellationToken ct = default)
    {
        var subject = $"Appointment Rescheduled by {visitorName}";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#1565c0; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">RESCHEDULED</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(employeeName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">The appointment with <strong>{EscapeHtml(visitorName)}</strong> has been <strong style=""color:#1565c0;"">rescheduled</strong>.</p>
            <div style=""background:#FFF3E0; border:1px solid #FFE0B2; border-radius:8px; padding:16px; margin-bottom:24px;"">
                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""font-size:14px; color:#333;"">
                    <tr><td style=""padding:6px 0; color:#888; width:140px;"">Previous Date</td><td style=""padding:6px 0; text-decoration:line-through; color:#999;"">{oldDate:MMMM dd, yyyy}</td></tr>
                    <tr><td style=""padding:6px 0; color:#888;"">New Date</td><td style=""padding:6px 0; font-weight:600; color:#0F6A38;"">{newDate:MMMM dd, yyyy}</td></tr>
                    <tr><td style=""padding:6px 0; color:#888;"">New Time</td><td style=""padding:6px 0; font-weight:600; color:#0F6A38;"">{newStartTime:h:mm tt} - {newEndTime:h:mm tt}</td></tr>
                </table>
            </div>
            {BuildEmployeeDetailsTable(visitorName, department, newDate, newStartTime, newEndTime, purpose, null, "Approved")}
            {(string.IsNullOrWhiteSpace(reason) ? "" : $@"
            <div style=""background:#E3F2FD; border-left:4px solid #1565c0; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#1565c0;""><strong>Reason for reschedule:</strong></p>
                <p style=""margin:6px 0 0; font-size:13px; color:#555;"">{EscapeHtml(reason)}</p>
            </div>")}";

        await SendAsync(toEmail, subject, body, ct);
    }

    public async Task SendEmployeeReminderAsync(string toEmail, string employeeName, string visitorName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, CancellationToken ct = default)
    {
        var subject = $"Reminder: Appointment Tomorrow with {visitorName}";
        var body = $@"
            <div style=""text-align:center; margin-bottom:24px;"">
                <div style=""display:inline-block; background:#F4B223; color:white; padding:6px 20px; border-radius:20px; font-size:13px; font-weight:600; letter-spacing:0.5px;"">REMINDER</div>
            </div>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:16px;"">Dear <strong>{EscapeHtml(employeeName)}</strong>,</p>
            <p style=""font-size:15px; color:#333; line-height:1.7; margin-bottom:24px;"">This is a reminder that you have an appointment <strong>tomorrow</strong> with a visitor.</p>
            {BuildEmployeeDetailsTable(visitorName, department, date, startTime, endTime, purpose, null, "Approved")}
            <div style=""background:#FFF3E0; border-left:4px solid #F4B223; padding:14px 18px; border-radius:0 8px 8px 0; margin-top:24px;"">
                <p style=""margin:0; font-size:14px; color:#e65100;""><strong>Please remember:</strong></p>
                <ul style=""margin:8px 0 0; padding-left:20px; font-size:13px; color:#555;"">
                    <li>Be available at the scheduled time</li>
                    <li>Prepare any documents the visitor may need</li>
                    <li>Notify the visitor if you need to reschedule</li>
                </ul>
            </div>";

        await SendAsync(toEmail, subject, body, ct);
    }

    private string WrapInBaseTemplate(string title, string content)
    {
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{EscapeHtml(title)}</title>
</head>
<body style=""margin:0; padding:0; background:#F4F6F8; font-family:Arial, Helvetica, sans-serif; -webkit-font-smoothing:antialiased;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#F4F6F8; padding:32px 16px;"">
        <tr>
            <td align=""center"">
                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""max-width:600px; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);"">

                    <!-- Header -->
                    <tr>
                        <td style=""background:linear-gradient(135deg, #0F6A38 0%, #0C5830 100%); padding:28px 32px; text-align:center;"">
                            <h1 style=""margin:0; color:white; font-size:24px; font-weight:700; letter-spacing:1px;"">ECX</h1>
                            <p style=""margin:4px 0 0; color:rgba(255,255,255,0.75); font-size:12px; letter-spacing:0.5px; text-transform:uppercase;"">Visitor Management System</p>
                            <div style=""width:40px; height:3px; background:#F4B223; margin:12px auto 0; border-radius:2px;""></div>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style=""padding:32px;"">
                            {content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""background:#F9FAFB; border-top:1px solid #E5E7EB; padding:24px 32px; text-align:center;"">
                            <p style=""margin:0 0 8px; font-size:12px; color:#999; line-height:1.6;"">
                                {_companyName} &mdash; {_companyAddress}
                            </p>
                            <p style=""margin:0 0 8px; font-size:12px; color:#999; line-height:1.6;"">
                                Phone: {_companyPhone} &nbsp;|&nbsp; Email: <a href=""mailto:{_supportEmail}"" style=""color:#0F6A38; text-decoration:none;"">{_supportEmail}</a>
                            </p>
                            <p style=""margin:0; font-size:11px; color:#bbb; line-height:1.6;"">
                                This is an automated notification. Please do not reply directly to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string BuildAppointmentDetailsTable(string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? notes, string status)
    {
        var statusColor = status switch
        {
            "Approved" => "#0F6A38",
            "Rejected" => "#c62828",
            "Cancelled" => "#f57f17",
            "Rescheduled" => "#1565c0",
            _ => "#F4B223"
        };

        return $@"
            <div style=""background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:20px; margin-bottom:20px;"">
                <h3 style=""margin:0 0 16px; font-size:16px; color:#333; border-bottom:2px solid #E5E7EB; padding-bottom:10px;"">Appointment Details</h3>
                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""font-size:14px; color:#333;"">
                    <tr>
                        <td style=""padding:8px 0; color:#888; width:140px; vertical-align:top;"">Status</td>
                        <td style=""padding:8px 0;"">
                            <span style=""display:inline-block; background:{statusColor}; color:white; padding:3px 12px; border-radius:12px; font-size:12px; font-weight:600;"">{EscapeHtml(status).ToUpper()}</span>
                        </td>
                    </tr>
                    <tr><td style=""padding:8px 0; color:#888;"" >Host Employee</td><td style=""padding:8px 0; font-weight:500;"">{EscapeHtml(employeeName)}</td></tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Department</td><td style=""padding:8px 0; font-weight:500;"">{EscapeHtml(department)}</td></tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Date</td><td style=""padding:8px 0; font-weight:500;"">{date:dddd, MMMM dd, yyyy}</td></tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Time</td><td style=""padding:8px 0; font-weight:500;"">{startTime:h:mm tt} - {endTime:h:mm tt}</td></tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Purpose</td><td style=""padding:8px 0; font-weight:500;"">{EscapeHtml(purpose)}</td></tr>
                    {(string.IsNullOrWhiteSpace(notes) ? "" : $"<tr><td style=\"padding:8px 0; color:#888;\">Notes</td><td style=\"padding:8px 0; font-weight:500;\">{EscapeHtml(notes)}</td></tr>")}
                </table>
            </div>";
    }

    private string BuildEmployeeDetailsTable(string visitorName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? notes, string status)
    {
        var statusColor = status switch
        {
            "Approved" => "#0F6A38",
            "Rejected" => "#c62828",
            "Cancelled" => "#f57f17",
            "Rescheduled" => "#1565c0",
            _ => "#F4B223"
        };

        return $@"
            <div style=""background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:20px; margin-bottom:20px;"">
                <h3 style=""margin:0 0 16px; font-size:16px; color:#333; border-bottom:2px solid #E5E7EB; padding-bottom:10px;"">Appointment Details</h3>
                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""font-size:14px; color:#333;"">
                    <tr>
                        <td style=""padding:8px 0; color:#888; width:140px; vertical-align:top;"">Status</td>
                        <td style=""padding:8px 0;"">
                            <span style=""display:inline-block; background:{statusColor}; color:white; padding:3px 12px; border-radius:12px; font-size:12px; font-weight:600;"">{EscapeHtml(status).ToUpper()}</span>
                        </td>
                    </tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Visitor</td><td style=""padding:8px 0; font-weight:500;"">{EscapeHtml(visitorName)}</td></tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Department</td><td style=""padding:8px 0; font-weight:500;"">{EscapeHtml(department)}</td></tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Date</td><td style=""padding:8px 0; font-weight:500;"">{date:dddd, MMMM dd, yyyy}</td></tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Time</td><td style=""padding:8px 0; font-weight:500;"">{startTime:h:mm tt} - {endTime:h:mm tt}</td></tr>
                    <tr><td style=""padding:8px 0; color:#888;"">Purpose</td><td style=""padding:8px 0; font-weight:500;"">{EscapeHtml(purpose)}</td></tr>
                    {(string.IsNullOrWhiteSpace(notes) ? "" : $"<tr><td style=\"padding:8px 0; color:#888;\">Notes</td><td style=\"padding:8px 0; font-weight:500;\">{EscapeHtml(notes)}</td></tr>")}
                </table>
            </div>";
    }

    private static string EscapeHtml(string? text)
    {
        if (string.IsNullOrEmpty(text)) return "";
        return System.Net.WebUtility.HtmlEncode(text);
    }
}
