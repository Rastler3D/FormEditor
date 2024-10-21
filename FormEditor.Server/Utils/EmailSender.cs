using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace FormEditor.Server.Utils;

public class EmailSender : IEmailSender
{
    private readonly SmtpClient _smtpClient;
    private readonly MailAddress _mailAddress;
    public EmailSender(IConfiguration config)
    {
        _smtpClient = new SmtpClient(config["SMTP_HOST"])
        {
            Port = int.Parse(config["SMTP_PORT"] ?? "587"),
            Credentials = new NetworkCredential(config["SMTP_USERNAME"], config["SMTP_PASSWORD"]),
            EnableSsl = true,
        };
        _mailAddress = new MailAddress(config["SMTP_DOMAIN"], config["SMTP_NAME"] ?? "Sender");
    }
    
    
    public Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var message = new MailMessage(_mailAddress, new MailAddress(email))
        {
            Subject = subject,
            Body = htmlMessage,
        };
        
        return _smtpClient.SendMailAsync(message);
    }
}