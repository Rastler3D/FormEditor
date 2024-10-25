namespace FormEditor.Server.ViewModels;

public class Aggregation
{
    public double? AverageNumber { get; set; }
    public double? MinNumber { get; set; }
    public double? MaxNumber { get; set; }
    public string? MostCommonText { get; set; }
    public int? UniqueCountText { get; set; }
    public int? TrueCountBoolean { get; set; }
    public int? FalseCountBoolean { get; set; }
    public OptionPair[]? OptionCountsSelect { get; set; }
}

public class OptionPair
{
    public string Option { get; set; }
    public int Count { get; set; }
}