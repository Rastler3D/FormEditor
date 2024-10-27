import {PaginationState, SortingState} from "@tanstack/solid-table";
import {User} from "~/contexts/AuthContext.tsx";
export const QuestionOptions = {
    SingleLine: "Single Line",
    MultiLine: "Multiple Lines",
    Integer: "Integer",
    Checkbox: "Checkbox",
    Select: "Select One"
}
export enum QuestionTypes {
    SingleLine = "SingleLine",
    MultiLine = "MultiLine",
    Integer = "Integer",
    Checkbox = "Checkbox",
    Select = "Select"
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
    fillingDate: string;
    answers: Record<number, Answer>
    sendEmail: boolean
}

export type TemplateInfo = Omit<Template, "questions">
export type TemplateConfiguration = Omit<Template, "id" | "creatorId" | "createdBy" | "createdAt" | "image" | "likes" | "filledCount" | "questions"> & {
    image?: string | File,
    questions: QuestionConfiguration[]
}
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
    questions: Question[];
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
    fillingDate: string;
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
    trueCountBoolean: number;
    falseCountBoolean: number;
    optionCountsSelect?: OptionPair[]
}

export interface OptionPair{
    option: string,
    count: number
}

export interface Comment {
    id: string;
    text: string;
    author: string;
    date: string;
    templateId: string;
}

export interface LikesInfo{
    likes: number;
    isLiked?: boolean;
}

export enum Action{
    Block = "Block",
    Unblock = "Unblock",
    Delete = "Delete"
}
export interface Bulk
{
    action: Action;
    ids: number[];
}

export type UpdateUser = Partial<Pick<User, "name" | "email" >> & { avatar?: string | File };

export interface TokenResponse {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
}

export interface TableData<T> {
    data: T;
    totalRows: number;
}