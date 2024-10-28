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
    Task<TableData<List<Form>>> GetSubmittedFormsAsync(int templateId, TableOption options);
    Task<TableData<List<Form>>> GetUserFormsAsync(int userId, TableOption options);
    Task<TableData<List<Form>>> GetFormsAsync(TableOption options);
    Task<Result<Form, Error>> GetSubmittedFormAsync(int templateId, int userId);
    Task<Result<Form, Error>> GetFormAsync(int formId);
    Task<Result<Form, Error>> SubmitFormAsync(Form filledForm);
    Task<Result<Form, Error>> UpdateFormAsync(Form filledForm);
    Task<Result<Error>> DeleteFormAsync(int formId);
}

public class FormRepository : IFormRepository
{
    private readonly AppDbContext _context;

    public FormRepository(AppDbContext context)
    {
        _context = context;
    }

    async Task<TableData<List<Form>>> ApplyTableOptions(IQueryable<Form> forms, TableOption options)
    {
        if (!String.IsNullOrWhiteSpace(options.Filter))
        {
            forms = forms.Where(f =>
                EF.Functions.ILike(f.Submitter.Name, $"%{options.Filter}%") ||
                EF.Functions.ILike(f.Template.Name, $"%{options.Filter}%")
            );
        }
        var totalRows = await forms.CountAsync();

        foreach (var sortOption in options.Sort)
        {
            Expression<Func<Form, object>> selector = sortOption.Id switch
            {
                "templateName" => x => x.Template.Name,
                "fillingDate" => x => x.FillingDate,
                "submittedBy" => x => x.Submitter.Name,
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

        forms = forms.Skip(options.Pagination.PageSize * options.Pagination.PageIndex)
            .Take(options.Pagination.PageSize);

        return new()
        {
            Data = await forms.ToListAsync(),
            TotalRows = totalRows
        };
    }

    private IQueryable<Form> LoadProperties(IQueryable<Form> forms)
    {
        return forms
            .Include(x => x.Answers)
            .Include(x => x.Template)
            .Include(x => x.Submitter);
    }

    public async Task<TableData<List<Form>>> GetFormsAsync(TableOption options)
    {
        var forms = LoadProperties(_context.Forms);

        return await ApplyTableOptions(forms, options);
    }

    public async Task<TableData<List<Form>>> GetUserFormsAsync(int userId, TableOption options)
    {
        var forms = LoadProperties(_context.Forms)
            .Where(x => x.SubmitterId == userId);

        return await ApplyTableOptions(forms, options);
    }

    public async Task<TableData<List<Form>>> GetSubmittedFormsAsync(int templateId, TableOption options)
    {
        var forms = LoadProperties(_context.Forms)
            .Where(f => f.TemplateId == templateId);

        return await ApplyTableOptions(forms, options);
    }

    public async Task<Result<Form, Error>> GetSubmittedFormAsync(int templateId, int userId)
    {
        var form = await LoadProperties(_context.Forms)
            .FirstOrDefaultAsync(f => f.TemplateId == templateId && f.SubmitterId == userId);

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

        await _context.Entry(filledForm).Reference(x => x.Template).LoadAsync();
        await _context.Entry(filledForm).Reference(x => x.Submitter).LoadAsync();

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

        await _context.Entry(existingForm).Reference(x => x.Submitter).LoadAsync();
        await _context.Entry(existingForm).Reference(x => x.Template).LoadAsync();

        return existingForm;
    }

    public async Task<Result<Form, Error>> GetFormAsync(int formId)
    {
        var form = await LoadProperties(_context.Forms)
            .FirstOrDefaultAsync(f => f.Id == formId);

        if (form == null)
        {
            return Error.NotFound($"Form not found");
        }

        return form;
    }

    public async Task<Result<Error>> DeleteFormAsync(int formId)
    {
        var form = await _context.Forms.FindAsync(formId);
        if (form == null)
        {
            Error.NotFound("Form not found");
        }

        _context.Forms.Remove(form);
        await _context.Templates
            .Where(x => x.Id == form.TemplateId)
            .ExecuteUpdateAsync(x =>
                x.SetProperty(t => t.FilledCount, t => t.FilledCount - 1));
        await _context.SaveChangesAsync();

        return Result<Error>.Ok();
    }
}