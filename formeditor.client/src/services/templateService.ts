// src/services/api.ts
import {
    Template,
    Comment,
    TemplateInfo,
    TagInfo,
    LikesInfo,
    TemplateConfiguration,
    AggregatedResults, TableOption, TableData
} from '~/types/template.ts';
import {api} from "~/lib/api.ts";
import {uploadImage} from "~/services/imageUploadService.ts";
import {optionToQueryParams} from "~/lib/utils.ts";


export const fetchUserTemplates = (userId: number, options: TableOption): Promise<TableData<TemplateInfo[]>> => {
    return api.get<TableData<TemplateInfo[]>>(`/Form/user/${userId}`, {params: optionToQueryParams(options)})
        .then(response => response.data);
};

export const fetchTemplates = (options: TableOption): Promise<TableData<TemplateInfo[]>> => {
    return api.get<TableData<TemplateInfo[]>>(`/Form`, {params: optionToQueryParams(options)})
        .then(response => response.data);
};

export const fetchLatestTemplates = (): Promise<TemplateInfo[]> => {
    return api.get<TemplateInfo[]>('/Template/latest')
        .then(response => response.data);
};

export const fetchPopularTemplates = (): Promise<TemplateInfo[]> => {
    return api.get<TemplateInfo[]>('/Template/popular')
        .then(response => response.data);
};

export const fetchTagsInfo = (): Promise<TagInfo[]> => {
    return api.get<TagInfo[]>('/Template/tags/stat')
        .then(response => response.data);
};

export const fetchTags = (): Promise<string[]> => {
    return api.get<string[]>('/Template/tags')
        .then(response => response.data);
};

export const fetchTopics = (): Promise<string[]> => {
    return api.get<string[]>('/Template/topics')
        .then(response => response.data);
};

export const createTemplate = async (template: TemplateConfiguration): Promise<TemplateInfo> => {
    if (template.image instanceof File) {
        template.image = await uploadImage(template.image);
    }
    return await api.post<TemplateInfo>('/Template', template)
        .then(response => response.data);
};

export const updateTemplate = async ({templateId, template}: {
    templateId: number;
    template: TemplateConfiguration
}): Promise<Template> => {
    if (template.image instanceof File) {
        template.image = await uploadImage(template.image);
    }
    return await api.put<Template>(`/Template/${templateId}`, template)
        .then(response => response.data);
};

export const fetchTemplate = (id: number): Promise<Template> => {
    return api.get<Template>(`/Template/${id}`)
        .then(response => response.data);
};

export const deleteTemplate = (templateId: number): Promise<void> => {
    return api.delete(`/Template/${templateId}`)
        .then(() => {
        });
};

export const toggleLike = (templateId: number): Promise<LikesInfo> => {
    return api.put<LikesInfo>(`/Template/${templateId}/likes/toggle`)
        .then(response => response.data);
};

export const fetchLikes = (templateId: number): Promise<LikesInfo> => {
    return api.get<LikesInfo>(`/Template/${templateId}/likes`)
        .then(response => response.data);
};

export const fetchAggregatedResults = (templateId: number): Promise<AggregatedResults> => {
    return api.get<AggregatedResults>(`/Template/${templateId}/aggregation`)
        .then(response => response.data);
};

export const fetchComments = (templateId: number): Promise<Comment[]> => {
    return api.get<Comment[]>(`/Template/${templateId}/comments`)
        .then(response => response.data);
};

export const addComment = (templateId: number, text: string): Promise<Comment> => {
    return api.post<Comment>(`/Template/${templateId}/comments`, JSON.stringify(text))
        .then(response => response.data);
};
