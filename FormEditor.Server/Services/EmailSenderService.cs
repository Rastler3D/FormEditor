using System.Text;
using FormEditor.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace FormEditor.Server.Services;

public interface IEmailSenderService
{
    Task SendFilledFormAsync(Form form);
}

public class EmailSenderService : IEmailSenderService
{
    private readonly IEmailSender _emailSender;

    public EmailSenderService(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    public async Task SendFilledFormAsync(Form form)
    {
        var message = GenerateFormHtmlMessage(form);
        
        await _emailSender.SendEmailAsync(form.Submitter.Email, $"Form {form.Template.Name}", message);
    }

    private string GenerateFormHtmlMessage(Form form)
    {
        var sb = new StringBuilder();

        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html lang=\"en\">");
        sb.AppendLine("<head>");
        sb.AppendLine("    <meta charset=\"UTF-8\">");
        sb.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        sb.AppendLine("    <title>Filled Form</title>");
        sb.AppendLine("    <style>");
        sb.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        sb.AppendLine("        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }");
        sb.AppendLine("        h1 { color: #2c3e50; }");
        sb.AppendLine(
            "        .form-info { background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px; }");
        sb.AppendLine("        .question { margin-bottom: 20px; }");
        sb.AppendLine("        .question h3 { color: #2980b9; margin-bottom: 5px; }");
        sb.AppendLine("        .answer { background-color: #ecf0f1; padding: 10px; border-radius: 3px; }");
        sb.AppendLine("    </style>");
        sb.AppendLine("</head>");
        sb.AppendLine("<body>");
        sb.AppendLine("    <div class=\"container\">");
        sb.AppendLine($"        <h1>Filled Form: {form.Template.Name}</h1>");
        sb.AppendLine("        <div class=\"form-info\">");
        sb.AppendLine($"            <p><strong>Submitted by:</strong> {form.Submitter.UserName}</p>");
        sb.AppendLine($"            <p><strong>Submitted on:</strong> {form.SubmittedAt.ToString("f")}</p>");
        sb.AppendLine($"            <p><strong>Filling Date:</strong> {form.FillingDate.ToString("d")}</p>");
        sb.AppendLine("        </div>");

        foreach (var question in form.Template.Questions.OrderBy(q => q.Order))
        {
            var answer = form.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            sb.AppendLine("        <div class=\"question\">");
            sb.AppendLine($"            <h3>{question.Title}</h3>");
            sb.AppendLine("            <div class=\"answer\">");
            if (answer != null)
            {
                switch (question.Type)
                {
                    case QuestionType.SingleLine:
                    case QuestionType.MultiLine:
                    case QuestionType.Select:
                        sb.AppendLine($"                <p>{answer.StringValue}</p>");
                        break;
                    case QuestionType.Integer:
                        sb.AppendLine($"                <p>{answer.NumericValue}</p>");
                        break;
                    case QuestionType.Checkbox:
                        sb.AppendLine($"                <p>{(answer.BooleanValue == true ? "Yes" : "No")}</p>");
                        break;
                }
            }
            else
            {
                sb.AppendLine("                <p>No answer provided</p>");
            }

            sb.AppendLine("            </div>");
            sb.AppendLine("        </div>");
        }

        sb.AppendLine("    </div>");
        sb.AppendLine("</body>");
        sb.AppendLine("</html>");

        return sb.ToString();
    }
}
