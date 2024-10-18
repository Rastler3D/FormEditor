﻿import {PaginationState, SortingState} from "@tanstack/solid-table";

export enum QuestionTypes {
    SingleLine = "Single Line",
    MultiLine = "Multiple Lines",
    Integer = "Integer",
    Checkbox = "Checkbox",
    Select = "Select One"
}
export type QuestionType = typeof QuestionTypes[keyof typeof QuestionTypes];

export type QuestionConfiguration = Omit<Question, "id"> & { id?: number };


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

export interface FilledForm {
    templateId: number;
    answers: Record<number, Answer>
}

export type TemplateInfo = Omit<Template, "questions">
export type TemplateConfiguration = Omit<Template, "id" | "creatorId" | "createdBy" | "createdAt" | "image" | "likes" | "filledCount"> & {image?: string | File}
export interface Template {
    id: number;
    name: string;
    description: string;
    topic: string;
    image?: string;
    creatorId: number;
    createdBy: string;
    createdAt: string;
    tags: string[];
    accessSetting: AccessSetting;
    allowList?: number[];
    filledCount: number;
    questions: QuestionConfiguration[];
    likes: number;
}

export enum AccessSetting {
    All = "All",
    Specified=  "Specified",
}

export interface Form {
    id: number;
    templateId: number;
    templateName: string;
    submitterId: number;
    submittedBy: string;
    submittedAt: string;
    answers: Record<number, Answer>;
}

export type FormInfo = Omit<Form, "answers">

export interface FormWithQuestion{
    form: Form;
    template: Template;
}

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

export interface Aggregation {
    averageNumber?: number;
    minNumber?: number;
    maxNumber?: number;
    mostCommonText?: string;
    uniqueCountText?: number;
    optionCountsSelect?: Record<number, number>
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
}

export interface LikesInfo{
    likes: number;
    isLiked: boolean;
}