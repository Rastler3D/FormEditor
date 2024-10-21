namespace FormEditor.Server.Models;

public class Answer
{
    public int Id { get; set; }
    public int FormId { get; set; }
    public Form Form { get; set; }
    public int QuestionId { get; set; }
    public Question Question { get; set; }
    public string StringValue { get; set; }
    public double? NumericValue { get; set; }
    public bool? BooleanValue { get; set; }
}