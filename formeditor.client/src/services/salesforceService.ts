import {api} from "~/lib/api.ts";

interface SalesforceAccount {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
}

export function createSalesforceAccount(account: SalesforceAccount): Promise<void> {
    return api.post(`/Salesforce/account`, account)
        .then(response => response.data)
}

export function disconnectSalesforce(): Promise<void> {
    return api.delete(`/Salesforce/account`)
        .then(response => response.data)
}

export function salesForceStatus(): Promise<boolean> {
    return api.get<boolean>(`/Salesforce/account/status`)
        .then(response => response.data)
}