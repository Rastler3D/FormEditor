import { createSignal } from 'solid-js';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import { Button } from '~/components/ui/button';
import { useLanguage } from '~/contexts/LanguageContext';
import { connectJira } from '~/services/jiraService';
import { showToast } from '~/components/ui/toast';
import { Label } from '~/components/ui/label';
import { Oval } from 'solid-spinner';
import {User} from "~/contexts/AuthContext.tsx";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "~/components/ui/dialog.tsx";

interface JiraIntegrationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
    onResult: (connected: boolean) => void;
}

export default function JiraIntegration(props: JiraIntegrationProps) {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = createSignal(false);

    const [email, setEmail] = createSignal(props.user.email);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await connectJira(email(), props.user.id);
            showToast({ title: t('JiraAccountCreated'), variant: 'success' });
            props.onResult(true);
        } catch (error) {
            showToast({ title: t('JiraAccountCreationFailed'), variant: 'destructive' });
            props.onResult(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("JiraIntegration")}</DialogTitle>
                    <DialogDescription>{t("CreateJiraAccountDescription")}</DialogDescription>
                </DialogHeader>
        <form onSubmit={handleSubmit} class="space-y-4">
            <TextField>
                <Label for="email">{t('Email')}</Label>
                <TextFieldInput
                    id="email"
                    type="email"
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    required
                />
            </TextField>
            <div class="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={isSubmitting()}>
                    {t('Cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting()}>
                    {isSubmitting() ? <Oval width="24" height="24" /> : t('ConnectJira')}
                </Button>
            </div>
        </form>
            </DialogContent>
        </Dialog>
    );
}