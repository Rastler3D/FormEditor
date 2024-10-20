﻿using FormEditor.Server.Models;

namespace FormEditor.Server.ViewModels;

public class TemplateConfiguration
{
    public int? Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Topic { get; set; }
    public string Image { get; set; }
    public List<string> Tags { get; set; }
    public AccessSetting AccessSetting { get; set; }
    public List<int> AllowList { get; set; }
    public List<Question> Questions { get; set; }
}