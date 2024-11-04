﻿import { createSignal } from 'solid-js';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import { Button } from '~/components/ui/button';
import { useLanguage } from '~/contexts/LanguageContext';
import { connectSalesforce } from '~/services/salesforceService';
import { showToast } from '~/components/ui/toast';
import { Label } from '~/components/ui/label';
import { Oval } from 'solid-spinner';
import {User} from "~/contexts/AuthContext.tsx";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "~/components/ui/dialog.tsx";

interface SalesforceIntegrationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
    onResult: (connected: boolean) => void;
}

export default function SalesforceIntegration(props: SalesforceIntegrationProps) {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = createSignal(false);

    const [formData, setFormData] = createSignal({
        firstName: props.user.name.split(' ')?.[0] ?? '',
        lastName: props.user.name.split(' ')?.[1] ?? '',
        email: props.user.email,
        company: '',
        phone: '',
    });

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await connectSalesforce(formData(), props.user.id);
            showToast({ title: t('SalesforceAccountCreated'), variant: 'success' });
            props.onResult(true);
        } catch (error) {
            showToast({ title: t('SalesforceAccountCreationFailed'), variant: 'destructive' });
            props.onResult(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("SalesforceIntegration")}</DialogTitle>
                    <DialogDescription>{t("CreateSalesforceAccountDescription")}</DialogDescription>
                </DialogHeader>
        <form onSubmit={handleSubmit} class="space-y-4">
            <TextField>
                <Label for="firstName">{t('FirstName')}</Label>
                <TextFieldInput
                    id="firstName"
                    type="text"
                    value={formData().firstName}
                    onInput={(e) => handleInputChange('firstName', e.currentTarget.value)}
                    required
                />
            </TextField>
            <TextField>
                <Label for="lastName">{t('LastName')}</Label>
                <TextFieldInput
                    id="lastName"
                    type="text"
                    value={formData().lastName}
                    onInput={(e) => handleInputChange('lastName', e.currentTarget.value)}
                    required
                />
            </TextField>
            <TextField>
                <Label for="email">{t('Email')}</Label>
                <TextFieldInput
                    id="email"
                    type="email"
                    value={formData().email}
                    onInput={(e) => handleInputChange('email', e.currentTarget.value)}
                    required
                />
            </TextField>
            <TextField>
                <Label for="company">{t('Company')}</Label>
                <TextFieldInput
                    id="company"
                    type="text"
                    value={formData().company}
                    onInput={(e) => handleInputChange('company', e.currentTarget.value)}
                    required
                />
            </TextField>
            <TextField>
                <Label for="phone">{t('Phone')}</Label>
                <TextFieldInput
                    id="phone"
                    type="tel"
                    value={formData().phone}
                    onInput={(e) => handleInputChange('phone', e.currentTarget.value)}
                />
            </TextField>
            <div class="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={isSubmitting()}>
                    {t('Cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting()}>
                    {isSubmitting() ? <Oval width="24" height="24" /> : t('ConnectSalesforce')}
                </Button>
            </div>
        </form>
            </DialogContent>
        </Dialog>
    );
}