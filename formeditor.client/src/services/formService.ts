// Form Service
import {
    Form,
    FormWithQuestion,
    FormInfo,
    TableOption,
    TableData
} from "~/types/template.ts";
import {api} from "~/lib/api.ts";

export const getSubmittedForms = (templateId: number, options: TableOption): Promise<TableData<Form[]>> => {
    return api.get<TableData<Form[]>>(`/Form/template/${templateId}`, { params: options })
        .then(response => response.data);
};

export const getUserForms = (userId: number, options: TableOption): Promise<TableData<FormInfo[]>> => {
    return api.get<TableData<FormInfo[]>>(`/Form/user/${userId}`, { params: options })
        .then(response => response.data);
};

export const getForms = (options: TableOption): Promise<TableData<FormInfo[]>> => {
    return api.get<TableData<FormInfo[]>>('/Form', { params: options })
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

export const submitForm = (filledForm: Form): Promise<FormInfo> => {
    return api.post<FormInfo>('/Form', filledForm)
        .then(response => response.data);
};

export const updateForm = (formId: number, filledForm: Form): Promise<FormInfo> => {
    return api.put<FormInfo>(`/Form/${formId}`, filledForm)
        .then(response => response.data);
};

export const deleteForm = (formId: number): Promise<void> => {
    return api.delete(`/Form/${formId}`)
        .then(() => {});
};