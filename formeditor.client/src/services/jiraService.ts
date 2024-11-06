import {api} from "~/lib/api.ts";
import {IntegrationStatus, TableData, TableOption, Ticket} from "~/types/types.ts";
import {optionToQueryParams} from "~/lib/utils.ts";

interface TicketRequest {
    summary: string;
    description: string;
    priority: "Low" | "Average" | "High";
    templateId: number;
    link: string;
}
export function connectJira(email: string, userId: number): Promise<void> {
    return api.post(`/Integrations/jira/account/${userId}?email=${encodeURI(email)}`)
        .then(response => response.data)
}

export function disconnectJira(userId: number): Promise<void> {
    return api.delete(`/Integrations/jira/account/${userId}`)
        .then(response => response.data)
}

export function jiraStatus(userId: number): Promise<IntegrationStatus<string>> {
    return api.get<IntegrationStatus<string>>(`/Integrations/jira/account/${userId}/status`)
        .then(response => response.data)
}

export function createTicket(ticketData: TicketRequest): Promise<string> {
    return api.post<string>('/Integrations/jira/ticket', ticketData)
        .then(response => response.data)
}

export function getTickets(userId: number, options: TableOption): Promise<TableData<Ticket[]>> {
    return api.get<TableData<Ticket[]>>(`/Integrations/jira/ticket/${userId}`, {params: optionToQueryParams(options)})
        .then(response => response.data)
}
