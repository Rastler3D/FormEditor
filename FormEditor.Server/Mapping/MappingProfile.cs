﻿using AutoMapper.Internal;
using FormEditor.Server.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace FormEditor.Server.Mapping;

using AutoMapper;
using Models;
using ViewModels;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<string, Tag>()
            .ConstructUsing(s => new Tag { Name = s })
            .ReverseMap()
            .ConstructUsing(t => t.Name);
        CreateMap<string, Topic>()
            .ConstructUsing(s => new Topic { Name = s })
            .ReverseMap()
            .ConstructUsing(t => t.Name);
        CreateMap<int, List<Like>>()
            .ConstructUsing(s => Enumerable.Range(0, s).Select(i => new Like { }).ToList())
            .ReverseMap()
            .ConstructUsing(t => t.Count);
        CreateMap<int, AllowList>()
            .ConstructUsing(s => new AllowList { UserId = s })
            .ReverseMap()
            .ConstructUsing(t => t.UserId);
        CreateMap<User, string>()
            .ConstructUsing(u => u.Name);
        CreateMap<AnswerViewModel, Answer>()
            .ForMember(dest => dest.QuestionId, opt => opt.MapFrom((src, dest, destMember, context) =>
                context.Items.TryGetValue("QuestionId", out var id) ? id : 0))
            .ReverseMap();
        CreateMap<Answer, AnswerViewModel>();
        CreateMap<QuestionViewModel, Question>()
            .ForMember(dest => dest.Order, opt => opt.MapFrom((src, dest, destMember, context) =>
                context.Items.TryGetValue("Index", out var index) ? index : 0))
            .ReverseMap();
        CreateMap<TemplateConfigurationViewModel, Template>()
            .ForMember(dest => dest.Questions, opt =>
                opt.MapFrom<List<Question>>((src, _, _, context) => src.Questions.Select((item, index) =>
                    {
                        var question = context.Mapper.Map<Question>(item);
                        question.Order = index;
                        return question;
                    }).ToList()
                )
            )
            .ForMember(dest => dest.CreatorId, opt => opt.MapFrom((src, dest, destMember, context) =>
                context.Items.TryGetValue("CreatorId", out var id) ? id : 0))
            .ForMember(dest => dest.Id, opt => opt.MapFrom((src, dest, destMember, context) =>
                context.Items.TryGetValue("TemplateId", out var id) ? id : 0));

        CreateMap<Template, TemplateInfoViewModel>()
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.Creator));
        CreateMap<Template, TemplateViewModel>()
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.Creator));
        CreateMap<Form, FormInfoViewModel>()
            .ForMember(dest => dest.TemplateName, opt => opt.MapFrom(src => src.Template.Name))
            .ForMember(dest => dest.SubmittedBy, opt => opt.MapFrom(src => src.Submitter.Name));
        CreateMap<Form, FormViewModel>()
            .ForMember(dest => dest.TemplateName, opt => opt.MapFrom(src => src.Template.Name))
            .ForMember(dest => dest.SubmittedBy, opt => opt.MapFrom(src => src.Submitter.Name))
            .ForMember(dest => dest.Answers, opt =>
                opt.MapFrom<Dictionary<int, AnswerViewModel>>((src, _, _, context) => src.Answers
                    .Select(item => (Id: item.QuestionId, Answer: context.Mapper.Map<AnswerViewModel>(item)))
                    .ToDictionary(x => x.Id, x => x.Answer)
                )
            );
        CreateMap<FilledFormViewModel, Form>()
            .ForMember(dest => dest.Answers, opt =>
                opt.MapFrom<List<Answer>>((src, _, _, context) => src.Answers
                    .Select(item =>
                    {
                        var answer = context.Mapper.Map<Answer>(item.Value);
                        answer.QuestionId = item.Key;
                        return answer;
                    }).ToList()
                )
            )
            .ForMember(dest => dest.SubmitterId, opt => opt.MapFrom((src, dest, destMember, context) =>
                context.Items.TryGetValue("SubmitterId", out var id) ? id : 0))
            .ForMember(dest => dest.Id, opt => opt.MapFrom((src, dest, destMember, context) =>
                context.Items.TryGetValue("FormId", out var id) ? id : 0));
        CreateMap<Form, FormWithQuestionViewModel>()
            .ForMember(dest => dest.Template, opt => opt.MapFrom(src => src.Template))
            .ForMember(dest => dest.Form, opt => opt.MapFrom(src => src));
        CreateMap<List<IdentityRole<int>>, RoleViewModel>()
            .ConstructUsing(s =>
                (s.FirstOrDefault(x => x.Name == Roles.Admin) == null) ? RoleViewModel.User : RoleViewModel.Admin);
        CreateMap<User, UserViewModel>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Role, opt =>
                opt.MapFrom(src => src.Roles))
            .ForMember(dest => dest.Status,
                opt => opt.MapFrom(src =>
                    src.LockoutEnabled && src.LockoutEnd.HasValue && src.LockoutEnd > DateTimeOffset.Now
                        ? StatusViewModel.Blocked
                        : StatusViewModel.Active));
        CreateMap<Comment, CommentViewModel>()
            .ForMember(dest => dest.Author, opt => opt.MapFrom(src => src.Author.Name))
            .ReverseMap();
        CreateMap<TableOptionViewModel, TableOption>()
            .ConstructUsing(s => new TableOption(s.page, s.pageSize, s.filter, s.sort));
    }
}