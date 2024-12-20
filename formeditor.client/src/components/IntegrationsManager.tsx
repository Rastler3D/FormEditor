﻿import {Button} from "~/components/ui/button";
import {useLanguage} from "~/contexts/LanguageContext";
import IntegrationCard from "./IntegrationCard";
import SalesforceIntegration from "~/components/SalesforceIntegration.tsx";
import {createResource} from "~/lib/action.ts";
import {salesForceStatus} from "~/services/salesforceService.ts";
import {createSignal, Show} from "solid-js";
import {User} from "~/contexts/AuthContext.tsx";
import {showToast} from "~/components/ui/toast.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import {CheckCircle, Copy, Key} from "lucide-solid";
import {jiraStatus} from "~/services/jiraService.ts";
import JiraIntegration from "~/components/JiraIntegration.tsx";
import {TextField, TextFieldInput} from "./ui/text-field";
import {generateApiToken, getApiToken} from "~/services/userService.ts";
import {Oval} from "solid-spinner";
import {ApiTokenResponse} from "~/types/types.ts";

interface IntegrationsManagerProps {
    user: User;
}

const fetchApiToken = () => {
    return new Promise<ApiTokenResponse | undefined>((res, rej) => {
        return getApiToken()
            .then(res)
            .catch(err => {
                if (err.status === 404) {
                    res(undefined);
                } else {
                    rej(err)
                }
            });
    });
}

function IntegrationsManager(props: IntegrationsManagerProps) {
    const {t} = useLanguage();
    const [showSalesforceDialog, setShowSalesforceDialog] = createSignal(false);
    const [showJiraDialog, setShowJiraDialog] = createSignal(false);
    const [salesforceConnection, {mutate: setSalesforceConnection}] = createResource(() => props.user.id, salesForceStatus);
    const [jiraConnection, {mutate: setJiraConnection}] = createResource(() => props.user.id, jiraStatus);
    const [apiToken, {mutate: setApiToken}] = createResource(() => props.user.id, fetchApiToken);
    const [isGeneratingToken, setIsGeneratingToken] = createSignal(false);
    const [isCopied, setIsCopied] = createSignal(false);

    const handleGenerateApiToken = async () => {
        setIsGeneratingToken(true);
        try {
            const apiToken = await generateApiToken();
            setApiToken(apiToken);
            showToast({title: t("ApiTokenGenerated"), variant: "success"});
        } catch (error) {
            showToast({title: t("ApiTokenGenerationFailed"), variant: "destructive"});
        } finally {
            setIsGeneratingToken(false);
        }
    };

    const copyToClipboard = async () => {
        if (apiToken()) {
            await navigator.clipboard.writeText(apiToken()!.apiToken);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div class="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center space-x-2">
                        <Key class="w-5 h-5"/>
                        <span>{t("ApiToken")}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p class="text-sm text-muted-foreground mb-4">{t("ApiTokenDescription")}</p>
                    <Show
                        when={!apiToken.loading}
                        fallback={<div class="animate-pulse h-10 bg-muted rounded-md"></div>}
                    >
                        <Show
                            when={apiToken()}
                            fallback={
                                <Button
                                    onClick={handleGenerateApiToken}
                                    class="w-full sm:w-auto"
                                    disabled={isGeneratingToken()}
                                >
                                    {isGeneratingToken() ? <Oval width="24" height="24"/> : t("GenerateApiToken")}
                                </Button>
                            }
                        >
                            <div class="flex items-center space-x-2  mb-4">
                                <TextField class="flex-grow">
                                    <TextFieldInput
                                        type="text"
                                        value={apiToken()?.apiToken}
                                        readOnly
                                        class="font-mono text-sm"
                                    />
                                </TextField>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={copyToClipboard}
                                    title={t("CopyToClipboard")}
                                >
                                    <Show when={!isCopied()} fallback={<CheckCircle class="w-4 h-4 text-green-500"/>}>
                                        <Copy class="w-4 h-4"/>
                                    </Show>
                                </Button>
                            </div>
                            <Button
                                onClick={handleGenerateApiToken}
                                disabled={isGeneratingToken()}
                            >
                                {isGeneratingToken() ? <Oval width="24" height="24"/> : t("Regenerate")}
                            </Button>
                        </Show>
                    </Show>
                </CardContent>
            </Card>
            <div>
                <h3 class="text-2xl font-semibold mb-4">{t("Integrations")}</h3>
                <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <IntegrationCard
                        title="Salesforce"
                        description={t("SalesforceIntegrationDescription")}
                        connected={salesforceConnection()?.isConnected}
                        loading={salesforceConnection.loading}
                        onToggle={() => setShowSalesforceDialog(true)}
                    />
                    <IntegrationCard
                        title="Jira"
                        description={t("JiraIntegrationDescription")}
                        connected={jiraConnection()?.isConnected}
                        loading={jiraConnection.loading}
                        onToggle={() => setShowJiraDialog(true)}
                    />
                </div>
            </div>
            <SalesforceIntegration
                onOpenChange={setShowSalesforceDialog}
                onResult={(status) => {
                    setSalesforceConnection(status);
                    setShowSalesforceDialog(false);
                }}
                integrationStatus={salesforceConnection()}
                open={showSalesforceDialog()}
                user={props.user}
            />
            <JiraIntegration
                onOpenChange={setShowJiraDialog}
                onResult={(status) => {
                    setJiraConnection(status);
                    setShowJiraDialog(false);
                }}
                integrationStatus={jiraConnection()}
                open={showJiraDialog()}
                user={props.user}
            />
        </div>
    );
}

export default IntegrationsManager;