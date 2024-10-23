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
        _smtpClient = new SmtpClient(config["SMTP_HOST"]??"smtp.mailersend.net")
        {
            Port = int.Parse(config["SMTP_PORT"] ?? "587"),
            Credentials = new NetworkCredential(config["SMTP_USERNAME"]??"MS_Qj61Cy@trial-yzkq340d636ld796.mlsender.net", config["SMTP_PASSWORD"]??"qlWAWXbVhKZE8Bgp"),
            EnableSsl = true,
        };
        _mailAddress = new MailAddress(config["SMTP_SENDER_EMAIL"]??"form-editor@trial-yzkq340d636ld796.mlsender.net", config["SMTP_SENDER_NAME"] ?? "Form Editor");
    }
    
    
    public Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var message = new MailMessage(_mailAddress, new MailAddress(email))
        {
            Subject = subject,
            Body = htmlMessage,
            IsBodyHtml = true
        };
        
        return _smtpClient.SendMailAsync(message);
    }
}