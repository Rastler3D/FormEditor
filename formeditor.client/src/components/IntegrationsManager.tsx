import {Button} from "~/components/ui/button";
import {useLanguage} from "~/contexts/LanguageContext";
import IntegrationCard from "./IntegrationCard";
import SalesforceIntegration from "~/components/SalesforceIntegration.tsx";
import {createResource} from "~/lib/action.ts";
import {disconnectSalesforce, salesForceStatus} from "~/services/salesforceService.ts";
import {createSignal} from "solid-js";
import {User} from "~/contexts/AuthContext.tsx";
import {showToast} from "~/components/ui/toast.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import { Key } from "lucide-solid";

interface IntegrationsManagerProps {
    user: User;
}

function IntegrationsManager(props: IntegrationsManagerProps) {
    const {t} = useLanguage();
    const [showSalesforceDialog, setShowSalesforceDialog] = createSignal(false);
    //const [showJiraDialog, setShowJiraDialog] = createSignal(false);
    const [salesforceConnected, {mutate: setSalesforceConnected}] = createResource(()=> props.user.id, salesForceStatus);
    // const [jiraConnected, setJiraConnected] = createSignal(false);
    // const [odooConnected, setOdooConnected] = createSignal(false);
    const handleGenerateApiToken = async () => {
        // Implement API token generation logic
    };

    const handleSalesforceIntegration = async () => {
        if (salesforceConnected()) {
            try {
                await disconnectSalesforce(props.user.id);
                setSalesforceConnected(false);
                showToast({title: t("SalesforceDisconnected"), variant: "success"});
            } catch (err) {
                showToast({title: t("SalesforceDisconnectionFailed"), variant: "destructive"});
            }
        } else {
            setShowSalesforceDialog(true);
        }
    };

    // const handleJiraIntegration = () => {
    //     if (jiraConnected()) {
    //         // Implement disconnect logic
    //         setJiraConnected(false);
    //         showToast({title: t("JiraDisconnected"), variant: "success"});
    //     } else {
    //         setShowJiraDialog(true);
    //     }
    // };
    //
    // const handleOdooIntegration = () => {
    //     if (odooConnected()) {
    //         // Implement disconnect logic
    //         setOdooConnected(false);
    //         showToast({title: t("OdooDisconnected"), variant: "success"});
    //     } else {
    //         // Implement connect logic
    //         setOdooConnected(true);
    //         showToast({title: t("OdooConnected"), variant: "success"});
    //     }
    // };
    
    return (
        <div class="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center space-x-2">
                        <Key class="w-5 h-5" />
                        <span>{t("ApiToken")}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p class="text-sm text-muted-foreground mb-4">{t("ApiTokenDescription")}</p>
                    <Button onClick={handleGenerateApiToken} class="w-full sm:w-auto">
                        {t("GenerateApiToken")}
                    </Button>
                </CardContent>
            </Card>
            <div>
                <h3 class="text-2xl font-semibold mb-4">{t("Integrations")}</h3>
                <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <IntegrationCard
                        title="Salesforce"
                        description={t("SalesforceIntegrationDescription")}
                        connected={salesforceConnected()}
                        loading={salesforceConnected.loading}
                        onToggle={handleSalesforceIntegration}
                    />
                    {/* Add more IntegrationCard components here as needed */}
                </div>
            </div>
            <SalesforceIntegration
                onOpenChange={setShowSalesforceDialog}
                onResult={(connected) => {
                    setShowSalesforceDialog(false);
                    setSalesforceConnected(connected);
                }}
                open={showSalesforceDialog()}
                user={props.user}
            />
        </div>
    );
}

export default IntegrationsManager;