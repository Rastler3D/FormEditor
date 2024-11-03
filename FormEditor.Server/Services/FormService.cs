using AutoMapper;
using FormEditor.Server.Repositories;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Identity;
using FormEditor.Server.Models;

namespace FormEditor.Server.Services;



public interface IFormService
{
    Task<TableData<List<FormViewModel>>> GetSubmittedFormsAsync(int templateId, TableOptionViewModel options);
    Task<TableData<List<FormInfoViewModel>>> GetUserFormsAsync(int userId, TableOptionViewModel options);
    Task<TableData<List<FormInfoViewModel>>> GetFormsAsync(TableOptionViewModel options);
    Task<Result<FormViewModel, Error>> GetSubmittedFormAsync(int templateId, int userId);
    Task<Result<FormViewModel, Error>> GetFormAsync(int formId);
    Task<Result<FormWithQuestionViewModel, Error>> GetFormWithTemplateAsync(int formId);
    Task<Result<FormInfoViewModel, Error>> SubmitFormAsync(FilledFormViewModel filledForm, int userId);
    Task<Result<FormInfoViewModel, Error>> UpdateFormAsync(int formId, FilledFormViewModel filledForm, int updatorId);
    Task<Result<Error>> DeleteFormAsync(int formId, int userId);
}

public class FormService : IFormService
{
    private readonly IMapper _mapper;
    private readonly IFormRepository _formRepository;
    private readonly ITemplateRepository _templateRepository;
    private readonly UserManager<User> _userManager;
    private readonly IEmailSenderService _emailSenderService;

    public FormService(IFormRepository formRepository, IMapper mapper, UserManager<User> userManager,
        IEmailSenderService emailSenderService, ITemplateRepository templateRepository)
    {
        _mapper = mapper;
        _formRepository = formRepository;
        _userManager = userManager;
        _emailSenderService = emailSenderService;
        _templateRepository = templateRepository;
    }

    public async Task<TableData<List<FormViewModel>>> GetSubmittedFormsAsync(int templateId, TableOptionViewModel options)
    {
        return (await _formRepository.GetSubmittedFormsAsync(templateId, _mapper.Map<TableOption>(options)))
            .MapData(x => x
                .Select(_mapper.Map<FormViewModel>)
                .ToList()
            );
    }

    public async Task<TableData<List<FormInfoViewModel>>> GetUserFormsAsync(int userId, TableOptionViewModel options)
    {
        return (await _formRepository.GetUserFormsAsync(userId, _mapper.Map<TableOption>(options)))
            .MapData(x => x
                .Select(_mapper.Map<FormInfoViewModel>)
                .ToList()
            );
    }

    public async Task<TableData<List<FormInfoViewModel>>> GetFormsAsync(TableOptionViewModel options)
    {
        return (await _formRepository.GetFormsAsync(_mapper.Map<TableOption>(options)))
            .MapData(x => x
                .Select(_mapper.Map<FormInfoViewModel>)
                .ToList()
            );
    }

    public async Task<Result<FormViewModel, Error>> GetSubmittedFormAsync(int templateId, int userId)
    {
        return (await _formRepository.GetSubmittedFormAsync(templateId, userId))
            .Map(x => _mapper.Map<FormViewModel>(x));
    }

    public async Task<Result<FormViewModel, Error>> GetFormAsync(int formId)
    {
        return (await _formRepository.GetFormAsync(formId))
            .Map(x => _mapper.Map<FormViewModel>(x));
    }

    public async Task<Result<FormWithQuestionViewModel, Error>> GetFormWithTemplateAsync(int formId)
    {
        var form = await _formRepository.GetFormAsync(formId);
        if (form.IsErr)
        {
            return form.Error;
        }

        var template = await _templateRepository.GetTemplateWithQuestionsAsync(form.Value.TemplateId);
        form.Value.Template = template.Value;

        return _mapper.Map<FormWithQuestionViewModel>(form.Value);
    }

    public async Task<Result<FormInfoViewModel, Error>> SubmitFormAsync(FilledFormViewModel filledForm, int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Error.NotFound("User not found");
        }
        
        var templateIsAllowed = await _templateRepository.GetTemplateIsAllowedAsync(filledForm.TemplateId, userId);

        if (templateIsAllowed.IsErr)
        {
            return templateIsAllowed.Error;
        }
        if (!templateIsAllowed.Value)
        {
            return Error.Unauthorized("You are not allowed to fill this form");
        }
        var newForm = _mapper.Map<Form>(filledForm, opt => opt.Items["SubmitterId"] = userId);

        var formSubmittion = await _formRepository.SubmitFormAsync(newForm);
        if (formSubmittion.IsErr)
        {
            return formSubmittion.Error;
        }
        var form = formSubmittion.Value;
        if (filledForm.SendEmail)
        {
            form.Template = (await _templateRepository.GetTemplateWithQuestionsAsync(form.TemplateId)).Value;
            await _emailSenderService.SendFilledFormAsync(form);
        }

        return _mapper.Map<FormInfoViewModel>(form);
    }

    public async Task<Result<FormInfoViewModel, Error>> UpdateFormAsync(int formId, FilledFormViewModel filledForm,
        int updatorId)
    {
        var user = await _userManager.FindByIdAsync(updatorId.ToString());

        var oldForm = await _formRepository.GetFormAsync(formId);
        if (oldForm.IsErr)
        {
            return oldForm.Error;
        }

        if (oldForm.Value.SubmitterId != user.Id && !await _userManager.IsInRoleAsync(user, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to edit this template");
        }

        var newForm = _mapper.Map<Form>(filledForm, opt => opt.Items["FormId"] = formId);
        var formUpdate = await _formRepository.UpdateFormAsync(newForm);
        if (formUpdate.IsErr)
        {
            return formUpdate.Error;
        }

        var form = formUpdate.Value;
        if (filledForm.SendEmail)
        {
            form.Template = (await _templateRepository.GetTemplateWithQuestionsAsync(form.TemplateId)).Value;
            await _emailSenderService.SendFilledFormAsync(form);
        }

        return _mapper.Map<FormInfoViewModel>(form);
    }

    public async Task<Result<Error>> DeleteFormAsync(int formId, int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        var formFind = await _formRepository.GetFormAsync(formId);
        if (formFind.IsErr)
        {
            return formFind.Error;
        }

        var form = formFind.Value;
        if (form.SubmitterId != user.Id && form.Template.CreatorId != user.Id && !await _userManager.IsInRoleAsync(user, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to delete this form");
        }

        return await _formRepository.DeleteFormAsync(formId);
    }
}