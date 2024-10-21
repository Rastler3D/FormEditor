using AutoMapper.Internal;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace FormEditor.Server.Mapping;

using AutoMapper;
using Models;
using ViewModels;

public class TemplateMappingProfile : Profile
{
    public TemplateMappingProfile()
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
        CreateMap<AnswerViewModel, Answer>()
            .ForMember(dest => dest.QuestionId, opt => opt.MapFrom((src, dest, destMember, context) =>
                context.Items.TryGetValue("QuestionId", out var id) ? id : 0))
            .ReverseMap();
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

        CreateMap<Template, TemplateInfoViewModel>();
        CreateMap<Template, TemplateViewModel>();
        CreateMap<Form, FormInfoViewModel>()
            .ForMember(dest => dest.TemplateName, opt => opt.MapFrom(src => src.Template.Name))
            .ForMember(dest => dest.SubmittedBy, opt => opt.MapFrom(src => src.Submitter.UserName));
        CreateMap<Form, FormViewModel>()
            .ForMember(dest => dest.TemplateName, opt => opt.MapFrom(src => src.Template.Name))
            .ForMember(dest => dest.SubmittedBy, opt => opt.MapFrom(src => src.Submitter.UserName))
            .ForMember(dest => dest.Answers, opt =>
                opt.MapFrom<Dictionary<int, AnswerViewModel>>((src, _, _, context) => src.Answers
                    .Select(item => (Id: item.Id, Answer: context.Mapper.Map<AnswerViewModel>(context)))
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
            .ForMember(x => x.Template, opt => opt.MapFrom(src => src.Template))
            .ForMember(x => x.Form, opt => opt.MapFrom(src => src));
        
    }
}