// src/services/api.ts
import {Template, Form, User, TemplateInfo, TagInfo, LikesInfo, TemplateConfiguration} from '~/types/template.ts';


export const fetchLatestTemplates = async (): Promise<TemplateInfo[]> => {
    await delay(500);
    // Simulated API call
    return [await fetchTemplate(1), await fetchTemplate(2)];
};

export const fetchPopularTemplates = async (): Promise<TemplateInfo[]> => {
    await delay(500);
    // Simulated API call
    return [await fetchTemplate(1), await fetchTemplate(2)];
};

export const fetchTagsInfo = async (): Promise<TagInfo[]> => {
    await delay(500);
    // Simulated API call
    return [{name: "Hello", count: 10}, {name: "World", count: 2}];
};

export const fetchTags = async (): Promise<string[]> => {
    await delay(500);
    // Simulated API call
    return ["Hello", "World"];
};

export const fetchTopics = async (): Promise<string[]> => {
    await delay(500);
    // Simulated API call
    return ["Hello", "World"];
};

export const createTemplate = async (template: TemplateConfiguration): Promise<TemplateInfo> => {}
export const updateTemplate = async ({templateId, template}: {templateId: number, template: TemplateConfiguration}): Promise<TemplateInfo> => {}

export const fetchTemplate = async (id: number): Promise<Template> => {
    await delay(500); // Simulate network delay
    // This is mock data. In a real app, you'd fetch from an API.
    return {
        id: 1,
        name: 'Job Application Questionnaire',
        description: 'A comprehensive questionnaire for job candidates to streamline our hiring process and gather essential information.',
        topic: 'other',
        image: null,
        tags: ['job', 'application', 'hiring'],
        accessSettings: 'all',
        questions: [
            {
                id: 1,
                type: 'Single Line',
                title: 'Position',
                description: 'What position are you applying for?',
                displayInTable: true
            },
            // ... other questions ...
        ],
        likes: 42,
        comments: [
            {
                id: 1,
                author: 'John Doe',
                text: 'This template is exactly what our HR department needed!',
                date: '2023-05-10T10:30:00Z'
            },
            // ... other comments ...
        ],
    };
};

export const fetchFilledForms = async (): Promise<{ data: Form[], totalPages: number }> => {
    await delay(500);
    return {
        data: [
            {
                id: 1,
                submittedBy: 'John Doe',
                position: 'Software Engineer',
                experience: 5,
                contact: 'john@example.com',
                additionalInfo: 'Passionate about clean code'
            },
            {
                id: 2,
                submittedBy: 'Jane Smith',
                position: 'Product Manager',
                experience: 7,
                contact: 'jane@example.com',
                additionalInfo: 'Experienced in Agile methodologies'
            },
            // ... other filled forms ...
        ],
        totalPages: 4
    };
};

export const submitForm = async (formData: any): Promise<void> => {
    await delay(500);
    console.log('Form submitted:', formData);
    // In a real app, you'd send this data to your backend
};

export const addComment = async (templateId: number, comment: string): Promise<void> => {
    await delay(500);
    console.log('Comment added:', comment);
    // In a real app, you'd send this to your backend
};

export const toggleLike = async (templateId: number): Promise<LikesInfo> => {
    await delay(500);
    // In a real app, you'd update this on the backend and return the new count
    return 43;
};

export const fetchLikes = async (templateId: number): Promise<LikesInfo> => {
    await delay(500);
    // In a real app, you'd update this on the backend and return the new count
    return 43;
};

