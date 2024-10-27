// Form Service
import {
    Form,
    FormWithQuestion,
    FormInfo,
    TableOption,
    TableData, FilledForm
} from "~/types/types.ts";
import {api} from "~/lib/api.ts";
import {optionToQueryParams} from "~/lib/utils.ts";

export const getSubmittedForms = (templateId: number, options: TableOption): Promise<TableData<Form[]>> => {
    return api.get<TableData<Form[]>>(`/Form/template/${templateId}`, {params: optionToQueryParams(options)})
        .then(response => response.data);
};

export const getUserForms = (userId: number, options: TableOption): Promise<TableData<FormInfo[]>> => {
    return api.get<TableData<FormInfo[]>>(`/Form/user/${userId}`, {params: optionToQueryParams(options)})
        .then(response => response.data);
};

export const getForms = (options: TableOption): Promise<TableData<FormInfo[]>> => {
    return api.get<TableData<FormInfo[]>>('/Form', {params: optionToQueryParams(options)})
        .then(response => response.data);
};

export const getSubmittedForm = (templateId: number, userId: number): Promise<Form> => {
    return api.get<Form>(`/Form/user/${userId}/template/${templateId}`)
        .then(response => response.data);
};

export const getForm = (formId: number): Promise<Form> => {
    return api.get<Form>(`/Form/${formId}`)
        .then(response => response.data);
};

export const getFormWithTemplate = (formId: number): Promise<FormWithQuestion> => {
    return api.get<FormWithQuestion>(`/Form/${formId}/full`)
        .then(response => response.data);
};

export const submitForm = (filledForm: FilledForm): Promise<FormInfo> => {
    return api.post<FormInfo>('/Form', filledForm)
        .then(response => response.data);
};

export const updateForm = ({ formId, filledForm }: { formId: number; filledForm: FilledForm }): Promise<FormInfo> => {
    return api.put<FormInfo>(`/Form/${formId}`, filledForm)
        .then(response => response.data);
};

export const submitOrUpdateForm = ({ formId, filledForm }: { formId?: number; filledForm: FilledForm }): Promise<FormInfo> => {
    if (formId){
        return updateForm({formId, filledForm});
    }
    return submitForm(filledForm);
}

export const deleteForm = (formId: number): Promise<void> => {
    return api.delete(`/Form/${formId}`)
        .then(() => {});
};