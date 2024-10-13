import {PaginationState, SortingState} from "@tanstack/solid-table";

export enum QuestionTypes {
    SingleLine = "Single Line",
    MultiLine = "Multiple Lines",
    Integer = "Integer",
    Checkbox = "Checkbox",
    Select = "Select One"
}
export type QuestionType = typeof QuestionTypes[keyof typeof QuestionTypes];


export interface Question {
    id: number;
    type: QuestionTypes;
    title: string;
    description: string;
    options?: string[]; // For Select type
    displayInTable: boolean;
}

export interface Answer {
    numericValue: number;
    stringValue: string;
    booleanValue: boolean;
}

export interface Form {
    templateId: number;
    answers: Record<number, Answer>
}

export type TemplateInfo = Omit<Template, "questions" | "comments">
export interface Template {
    id: number;
    name: string;
    description: string;
    topic: string;
    image: string | null;
    creatorId: number;
    createdBy: string;
    createdAt: string;
    tags: string[];
    accessSetting: 'all' | 'specified';
    allowList: number[];
    filledCount: number;
    questions: Question[];
    likes: number;
    comments: {
        id: number;
        author: string;
        text: string;
        date: string;
    }[];
}

export interface FilledForm {
    id: number;
    templateId: number;
    userId: number;
    userName: string;
    submittedAt: string;
    answers: Record<number, Answer>;
}

export type SubmittedForm = Omit<FilledForm, "answers">

export const TopicOptions = [
    { value: 'education', label: 'Education' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'other', label: 'Other' },
];

export interface TableOption {
    pagination: PaginationState;
    sort: SortingState;
    filter: string;
}

export interface TagInfo {
    name: string,
    count: number
}

export interface AggregatedResults {
    questions: Record<number, Aggregation>;
}

export interface Aggregation{
    averageNumber?: number;
    minNumber?: number;
    maxNumber?: number;
    mostCommonText?: string;
    uniqueCountText?: number;
    optionCountsSelect?: Record<number, number>;
    falseCountBool?: number;
    trueCountBool?: boolean;
}