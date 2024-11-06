import {createSignal, Show} from 'solid-js';
import {TextField, TextFieldInput} from '~/components/ui/text-field';
import {Button} from '~/components/ui/button';
import {useLanguage} from '~/contexts/LanguageContext';
import {connectJira} from '~/services/jiraService';
import {showToast} from '~/components/ui/toast';
import {Label} from '~/components/ui/label';
import {Oval} from 'solid-spinner';
import {User} from "~/contexts/AuthContext.tsx";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "~/components/ui/dialog.tsx";
import {createWritableMemo} from '@solid-primitives/memo';
import {IntegrationStatus} from "~/types/types.ts";
import {disconnectSalesforce} from "~/services/salesforceService.ts";

interface JiraIntegrationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
    onResult: (connected: IntegrationStatus<string>) => void;
    integrationStatus?: IntegrationStatus<string>;
}

export default function JiraIntegration(props: JiraIntegrationProps) {
    const {t} = useLanguage();
    const [isSubmitting, setIsSubmitting] = createSignal(false);

    const [email, setEmail] = createWritableMemo(() => props.integrationStatus?.isConnected ? 
        props.integrationStatus.info : 
        props.user.email
    );

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = email();
            await connectJira(data, props.user.id);
            showToast({title: t('JiraAccountCreated'), variant: 'success'});
            props.onResult({isConnected: true, info: data});
        } catch (error) {
            showToast({title: t('JiraAccountCreationFailed'), variant: 'destructive'});
            props.onResult({isConnected: false});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDisable = async () => {
        setIsSubmitting(true);
        try {
            await disconnectSalesforce(props.user.id);
            showToast({title: t("JiraDisconnected"), variant: "success"});
            props.onResult({isConnected: false});
        } catch (err) {
            showToast({title: t("JiraDisconnectionFailed"), variant: "destructive"});
            props.onResult({isConnected: true, info: props.integrationStatus.info});
        } finally {
            setIsSubmitting(false);
        }
    }

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
                        <Show when={!props.integrationStatus.isConnected} fallback={
                            <Button disabled={isSubmitting()} variant="destructive" onClick={handleDisable}>
                                {isSubmitting() ? <Oval width="24" height="24" /> : t('Disconnect')}
                            </Button>
                        }>
                            <Button type="submit" disabled={isSubmitting()}>
                                {isSubmitting() ? <Oval width="24" height="24" /> : t('ConnectJira')}
                            </Button>
                        </Show>
                        <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}
                                disabled={isSubmitting()}>
                            {t('Cancel')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}