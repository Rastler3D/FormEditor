// Form Service
import {AggregatedResults, Answer, FilledForm, Form, FormWithQuestion, SubmittedForm} from "~/types/template.ts";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const fetchFilledForms = async (templateId: number): Promise<Form[]> => {
        await delay(500);
        return [
            { id: 1, userName: 'John Doe', position: 'Software Engineer', experience: 5, contact: 'john@example.com', additionalInfo: 'Passionate about clean code' },
            { id: 2, userName: 'Jane Smith', position: 'Product Manager', experience: 7, contact: 'jane@example.com', additionalInfo: 'Experienced in Agile methodologies' },
            // ... other filled forms ...
        ];
};

export const fetchTemplateSubmission = async (templateId: number): Promise<Form> => {
    // Implement API call to submit form
};
export const submitForm = async (form: FilledForm): Promise<SubmittedForm> => {
    // Implement API call to submit form
};

export const fetchForm = async (formId: number): Promise<FormWithQuestion> => {
    // Implement API call to submit form
};
export const fetchAggregatedResults = async (templateId: number): Promise<AggregatedResults> => {
    // Implement API call to fetch aggregated results
    return []
};
    // Add other form-related methods