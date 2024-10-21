﻿using AutoMapper;
using FormEditor.Server.Repositories;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace FormEditor.Server.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FormEditor.Server.Models;

public interface IFormService
{
    Task<List<FormViewModel>> GetSubmittedFormsAsync(int templateId, TableOption options);
    Task<List<FormInfoViewModel>> GetUserFormsAsync(int userId, TableOption options);
    Task<List<FormInfoViewModel>> GetFormsAsync(TableOption options);
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

    public async Task<List<FormViewModel>> GetSubmittedFormsAsync(int templateId, TableOption options)
    {
        return (await _formRepository.GetSubmittedFormsAsync(templateId, options))
            .Select(_mapper.Map<FormViewModel>)
            .ToList();
    }

    public async Task<List<FormInfoViewModel>> GetUserFormsAsync(int userId, TableOption options)
    {
        return (await _formRepository.GetUserFormsAsync(userId, options))
            .Select(_mapper.Map<FormInfoViewModel>)
            .ToList();
    }

    public async Task<List<FormInfoViewModel>> GetFormsAsync(TableOption options)
    {
        return (await _formRepository.GetFormsAsync(options))
            .Select(_mapper.Map<FormInfoViewModel>)
            .ToList();
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
        var template = await _templateRepository.GetTemplateAsync(form.Value.TemplateId);
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

        var newForm = _mapper.Map<Form>(filledForm, opt => opt.Items["SubmitterId"] = userId);

        var formSubmittion = await _formRepository.SubmitFormAsync(newForm);
        if (formSubmittion.IsErr)
        {
            return formSubmittion.Error;
        }

        if (filledForm.SendEmail)
        {
            await _emailSenderService.SendFilledFormAsync(formSubmittion.Value);
        }

        return _mapper.Map<FormInfoViewModel>(formSubmittion.Value);
    }

    public async Task<Result<FormInfoViewModel, Error>> UpdateFormAsync(int formId, FilledFormViewModel filledForm,
        int updatorId)
    {
        var user = await _userManager.FindByIdAsync(updatorId.ToString());

        var template = await _formRepository.GetFormAsync(formId);
        if (template.IsErr)
        {
            return template.Error;
        }

        if (template.Value.SubmitterId != user.Id && !await _userManager.IsInRoleAsync(user, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to edit this template");
        }

        var newForm = _mapper.Map<Form>(filledForm, opt => opt.Items["FormId"] = formId);
        var formUpdate = await _formRepository.UpdateFormAsync(newForm);
        if (formUpdate.IsErr)
        {
            return formUpdate.Error;
        }

        if (filledForm.SendEmail)
        {
            await _emailSenderService.SendFilledFormAsync(formUpdate.Value);
        }

        return _mapper.Map<FormInfoViewModel>(formUpdate.Value);
    }

    public async Task<Result<Error>> DeleteFormAsync(int formId, int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        var form = await _formRepository.GetFormAsync(formId);
        if (form.IsErr)
        {
            return form.Error;
        }

        if (form.Value.SubmitterId != user.Id && !await _userManager.IsInRoleAsync(user, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to delete this form");
        }

        return await _formRepository.DeleteFormAsync(formId);
    }
}