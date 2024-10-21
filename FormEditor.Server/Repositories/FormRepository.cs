using System.Linq.Expressions;
using AutoMapper;
using EntityFramework.Exceptions.Common;
using FormEditor.Server.Data;
using FormEditor.Server.Models;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace FormEditor.Server.Repositories;

public interface IFormRepository
{
    Task<List<Form>> GetSubmittedFormsAsync(int templateId, TableOption options);
    Task<List<Form>> GetUserFormsAsync(int userId, TableOption options);
    Task<List<Form>> GetFormsAsync(TableOption options);
    Task<Result<Form, Error>> GetSubmittedFormAsync(int templateId, int userId);
    Task<Result<Form, Error>> GetFormAsync(int formId);
    Task<Result<Form, Error>> SubmitFormAsync(Form filledForm);
    Task<Result<Form, Error>> GetFormWithTemplateAsync(int formId);
    Task<Result<Form, Error>> UpdateFormAsync(Form filledForm);
    Task DeleteFormAsync(int formId);
}

public class FormRepository : IFormRepository
{
    private readonly AppDbContext _context;

    public FormRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Form>> ApplyTableOptions(IQueryable<Form> forms, TableOption options)
    {
        if (!String.IsNullOrWhiteSpace(options.Filter))
        {
            forms = forms.Where(f => f.Submitter.UserName == options.Filter);
        }

        foreach (var sortOption in options.Sort)
        {
            Expression<Func<Form, object>> selector = sortOption.Id switch
            {
                "Template Name" => x => x.Template.Name,
                "Filling Date" => x => x.FillingDate,
                "Submitted By" => x => x.Submitter.UserName,
                _ => x => x.Id
            };
            
            if (sortOption.Desc)
            {
                forms = forms.OrderByDescending(selector);
            }
            else
            {
                forms = forms.OrderBy(selector);
            }
        }
        
        forms = forms.Skip(options.Pagination.PageSize * options.Pagination.PageIndex).Take(options.Pagination.PageSize);
        
        return await forms.ToListAsync();
    }
    
    public async Task<List<Form>> GetFormsAsync(TableOption options)
    {
        var forms = _context.Forms
            .Include(x => x.Answers)
            .Include(x => x.Template)
            .Include(x => x.Submitter);
        
        return await ApplyTableOptions(forms, options);
       
    }
    public async Task<List<Form>> GetUserFormsAsync(int userId, TableOption options)
    {
        var forms = _context.Forms
            .Include(x => x.Answers)
            .Include(x => x.Template)
            .Include(x => x.Submitter)
            .Where(x => x.SubmitterId == userId);
        
        return await ApplyTableOptions(forms, options);
       
    }

    public async Task<List<Form>> GetSubmittedFormsAsync(int templateId, TableOption options)
    {
        var forms = _context.Forms
            .Include(x => x.Answers)
            .Include(x => x.Submitter)
            .Where(f => f.TemplateId == templateId);
        
        return await ApplyTableOptions(forms, options);
       
    }

    public async Task<Result<Form, Error>> GetSubmittedFormAsync(int templateId, int userId)
    {
        var form = await _context.Forms
            .Include(x => x.Answers)
            .Include(x => x.Submitter)
            .FirstOrDefaultAsync(f => f.TemplateId == templateId || f.SubmitterId == userId);

        if (form == null)
        {
            return Error.NotFound("Submitted form not found");
        }

        return form;
    }
    
    public async Task<Result<Form, Error>> SubmitFormAsync(Form filledForm)
    {
        filledForm.SubmittedAt = DateTime.Now;
        try
        {
            await _context.Forms.AddAsync(filledForm);
            await _context.Templates
                .Where(x => x.Id == filledForm.TemplateId)
                .ExecuteUpdateAsync(x =>
                    x.SetProperty(t => t.FilledCount, t => t.FilledCount + 1));
            await _context.SaveChangesAsync();
        }
        catch (ReferenceConstraintException e) when (e.ConstraintName.Contains("Template",
                                                         StringComparison.InvariantCultureIgnoreCase))
        {
            return Error.NotFound($"Referenced template not found.");
        }
        
        return filledForm;
    }
    
    public async Task<Result<Form, Error>> UpdateFormAsync(Form filledForm)
    {
        var findingForm = await GetFormAsync(filledForm.Id);
        if (findingForm.IsErr)
        {
            return findingForm;
        }

        var existingForm = findingForm.Value;
        
        existingForm.FillingDate = filledForm.FillingDate;
        existingForm.Answers = filledForm.Answers;
        
        try
        {
            _context.Forms.Update(existingForm);
            await _context.SaveChangesAsync();
        }
        catch (ReferenceConstraintException e) when (e.ConstraintName.Contains("Template",
                                                         StringComparison.InvariantCultureIgnoreCase))
        {
            return Error.NotFound($"Referenced template not found.");
        }


        return filledForm;
    }

    public async Task<Result<Form, Error>> GetFormAsync(int formId)
    {
        var forms = await _context.Forms
            .Include(x => x.Answers)
            .Include(x => x.Submitter)
            .FirstOrDefaultAsync(f => f.Id == formId);
        if (forms == null)
        {
            return Error.NotFound($"Form not found");
        }
        
        return forms;
    }
    public async Task<Result<Form, Error>> GetFormWithTemplateAsync(int formId)
    {
        var forms = await GetFormAsync(formId);
        if (forms.IsErr)
        {
            return forms;
        }
        await _context.Entry(forms.Value).Reference(x => x.Template).LoadAsync();
        
        return forms;
    }
    
    public async Task DeleteFormAsync(int formId)
    {
        var form = await _context.Forms.FindAsync(formId);
        if (form != null)
        {
            _context.Forms.Remove(form);
            await _context.Templates
                .Where(x => x.Id == form.TemplateId)
                .ExecuteUpdateAsync(x =>
                    x.SetProperty(t => t.FilledCount, t => t.FilledCount - 1));
            await _context.SaveChangesAsync();
        }
    }
}