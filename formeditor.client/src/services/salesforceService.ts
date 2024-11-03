import {api} from "~/lib/api.ts";

interface SalesforceAccount {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
}

export function createSalesforceAccount(account: SalesforceAccount, userId: number): Promise<void> {
    return api.post(`/Integrations/salesforce/account/${userId}`, account)
        .then(response => response.data)
}

export function disconnectSalesforce(userId: number): Promise<void> {
    return api.delete(`/Integrations/salesforce/account/${userId}`)
        .then(response => response.data)
}

export function salesForceStatus(userId: number): Promise<boolean> {
    return api.get<boolean>(`/Integrations/salesforce/account/${userId}/status`)
        .then(response => response.data)
}