import {api} from "~/lib/api.ts";
import {IntegrationStatus} from "~/types/types.ts";

export interface SalesforceAccount {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
}

export function connectSalesforce(account: SalesforceAccount, userId: number): Promise<void> {
    return api.post(`/Integrations/salesforce/account/${userId}`, account)
        .then(response => response.data)
}

export function disconnectSalesforce(userId: number): Promise<void> {
    return api.delete(`/Integrations/salesforce/account/${userId}`)
        .then(response => response.data)
}

export function salesForceStatus(userId: number): Promise<IntegrationStatus<SalesforceAccount>> {
    return api.get<IntegrationStatus<SalesforceAccount>>(`/Integrations/salesforce/account/${userId}/status`)
        .then(response => response.data)
}