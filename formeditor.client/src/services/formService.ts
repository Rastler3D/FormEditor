// Form Service
import {AggregatedResults, Answer, FilledForm, Form, SubmittedForm} from "~/types/template.ts";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const fetchFilledForms = async (templateId: number): Promise<FilledForm[]> => {
        await delay(500);
        return [
            { id: 1, userName: 'John Doe', position: 'Software Engineer', experience: 5, contact: 'john@example.com', additionalInfo: 'Passionate about clean code' },
            { id: 2, userName: 'Jane Smith', position: 'Product Manager', experience: 7, contact: 'jane@example.com', additionalInfo: 'Experienced in Agile methodologies' },
            // ... other filled forms ...
        ];
};

export const fetchSubmittedForm = async (templateId: number): Promise<FilledForm> => {
    // Implement API call to submit form
};
export const submitForm = async (form: Form): Promise<SubmittedForm> => {
    // Implement API call to submit form
};
export const fetchAggregatedResults = async (templateId: number): Promise<AggregatedResults> => {
    // Implement API call to fetch aggregated results
    return []
};
    // Add other form-related methods