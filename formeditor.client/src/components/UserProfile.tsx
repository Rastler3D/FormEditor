import {createEffect, createSignal, Show} from "solid-js";
import {Card, CardContent, CardFooter} from "~/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar";
import {AlertCircle, Camera, Mail, UserIcon, Check, X} from "lucide-solid";
import {Label} from "~/components/ui/label";
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Button} from "~/components/ui/button";
import {Alert, AlertDescription} from "~/components/ui/alert";
import {createWritableMemo} from "@solid-primitives/memo";
import {useAuth, User} from "~/contexts/AuthContext";
import {createAction, createResource, resolve} from "~/lib/action";
import {Oval} from "solid-spinner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import SalesforceForm from "~/components/SalesforceForm";
import {useLanguage} from "~/contexts/LanguageContext";
import {showToast} from "~/components/ui/toast";
import {disconnectSalesforce, salesForceStatus} from "~/services/salesforceService.ts";

interface UserProfileProps {
    isReadonly: boolean;
    user: User;
    onUserUpdated: (user: User) => void;
}

function UserProfile(props: UserProfileProps) {
    const [name, setName] = createWritableMemo(() => props.user.name);
    const [email, setEmail] = createWritableMemo(() => props.user.email);
    const [avatar, setAvatar] = createWritableMemo(() => props.user.avatar);
    const [isEdit, setIsEdit] = createSignal(false);
    const [showSalesforceDialog, setShowSalesforceDialog] = createSignal(false);
    const [showJiraDialog, setShowJiraDialog] = createSignal(false);
    const {updateUser} = useAuth();
    const update = createAction(updateUser, () => props.user.id);

    const {t} = useLanguage();

    // Simulated integration statuses (replace with actual data from your backend)
    const [salesforceConnected, {mutate: setSalesforceConnected}] = createResource(salesForceStatus);
    const [jiraConnected, setJiraConnected] = createSignal(false);
    const [odooConnected, setOdooConnected] = createSignal(false);

    const previewAvatar = (avatar: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setAvatar(e.target?.result as string);
        reader.readAsDataURL(avatar);
    };

    const handleChangeAvatar = async (avatar: File | null) => {
        if (avatar) {
            previewAvatar(avatar);
            update({avatar: avatar});
        }
    };

    const handleEditProfile = () => {
        setIsEdit(true);
    };

    const handleCancelEditProfile = () => {
        setName(props.user.name);
        setEmail(props.user.email);
        setIsEdit(false);
    };

    const handleSubmit = () => {
        update({
            name: name(),
            email: email(),
        });
    };

    const handleGenerateApiToken = async () => {
        try {
            const result = await generateToken();
            if (result.ok) {
                showToast({title: t("ApiTokenGenerated"), description: result.value, variant: "success"});
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showToast({title: t("ApiTokenGenerationFailed"), description: error.message, variant: "destructive"});
        }
    };

    const handleSalesforceIntegration = async () => {
        if (salesforceConnected()) {
            try {
                await disconnectSalesforce();
                setSalesforceConnected(false);
                showToast({title: t("SalesforceDisconnected"), variant: "success"});
            } catch (err) {
                showToast({title: t("SalesforceDisconnectionFailed"), variant: "destructive"});
            }
        } else {
            setShowSalesforceDialog(true);
        }
    };

    const handleJiraIntegration = () => {
        if (jiraConnected()) {
            // Implement disconnect logic
            setJiraConnected(false);
            showToast({title: t("JiraDisconnected"), variant: "success"});
        } else {
            setShowJiraDialog(true);
        }
    };

    const handleOdooIntegration = () => {
        if (odooConnected()) {
            // Implement disconnect logic
            setOdooConnected(false);
            showToast({title: t("OdooDisconnected"), variant: "success"});
        } else {
            // Implement connect logic
            setOdooConnected(true);
            showToast({title: t("OdooConnected"), variant: "success"});
        }
    };

    createEffect(resolve(update.data, (user) => props.onUserUpdated(user)));
    createEffect(() => {
        if (update.data.error) {
            setName(props.user.name);
            setEmail(props.user.email);
            setAvatar(props.user.avatar);
        }
    });

    createEffect(() => {
        if (props.user) {
            setIsEdit(false);
        }
    });

    return (
        <Card class="w-full max-w-4xl mx-auto overflow-hidden">
            <CardContent class="p-6">
                <div class="flex flex-col items-center mb-6">
                    <Avatar class="w-32 h-32 border-4 border-background shadow-xl">
                        <Show
                            when={avatar()}
                            fallback={
                                <AvatarFallback class="text-4xl">
                                    {name()
                                        .split(" ", 2)
                                        .map((n) => n.charAt(0))
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            }
                        >
                            <AvatarImage src={avatar()} alt={name()}/>
                        </Show>
                    </Avatar>
                    <h1 class="mt-4 text-3xl font-bold text-foreground">{name()}</h1>
                </div>

                <Tabs defaultValue="profile" class="w-full">
                    <TabsList class="grid w-full grid-cols-3">
                        <TabsTrigger value="profile">{t("Profile")}</TabsTrigger>
                        <TabsTrigger value="integrations">{t("Integrations")}</TabsTrigger>
                        <TabsTrigger value="tickets">{t("Tickets")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <div class="space-y-6">
                            <Show
                                when={!props.isReadonly && isEdit()}
                                fallback={
                                    <div class="space-y-6">
                                        <div>
                                            <Label class="text-sm font-medium">{t("Name")}</Label>
                                            <div class="flex items-center mt-1 p-2 rounded-md">
                                                <UserIcon size={18} class="text-primary mr-2"/>
                                                <span class="text-lg">{name()}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label class="text-sm font-medium">{t("Email")}</Label>
                                            <div class="flex items-center mt-1 p-2 rounded-md">
                                                <Mail size={18} class="text-primary mr-2"/>
                                                <span class="text-lg">{email()}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                            >
                                <div class="space-y-6">
                                    <TextField
                                        value={name()}
                                        onChange={(value) => setName(value)}
                                        readOnly={update.data.loading}
                                    >
                                        <Label for="name">{t("Name")}</Label>
                                        <TextFieldInput id="name" type="text" required class="text-lg"/>
                                    </TextField>
                                    <TextField
                                        value={email()}
                                        onChange={(value) => setEmail(value)}
                                        readOnly={update.data.loading}
                                    >
                                        <Label for="email">{t("Email")}</Label>
                                        <TextFieldInput id="email" type="email" required class="text-lg"/>
                                    </TextField>
                                </div>
                            </Show>
                            <div class="flex flex-wrap gap-3">
                                <Show when={!props.isReadonly}>
                                    <Show
                                        when={isEdit()}
                                        fallback={
                                            <Button onClick={handleEditProfile} class="w-full sm:w-auto text-nowrap">
                                                {t("EditProfile")}
                                            </Button>
                                        }
                                    >
                                        <div class="flex gap-3">
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={update.data.loading}
                                                class="w-full sm:w-auto text-nowrap"
                                            >
                                                {update.data.loading ?
                                                    <Oval width="24" height="24"/> : t("UpdateProfile")}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                disabled={update.data.loading}
                                                onClick={handleCancelEditProfile}
                                                class="w-full sm:w-auto text-nowrap"
                                            >
                                                {t("Cancel")}
                                            </Button>
                                        </div>
                                    </Show>
                                </Show>
                                <Show when={!props.isReadonly && !isEdit()}>
                                    <Label for="avatar-upload" class="cursor-pointer">
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            class="hidden"
                                            onChange={(e) => handleChangeAvatar(e.currentTarget.files?.[0] || null)}
                                        />
                                        <Button
                                            as="span"
                                            variant="outline"
                                            type="button"
                                            class="w-full sm:w-auto flex items-center justify-center gap-2 text-nowrap"
                                        >
                                            <Camera size={16}/>
                                            {t("ChangeAvatar")}
                                        </Button>
                                    </Label>
                                </Show>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="integrations">
                        <div class="space-y-6">
                            <div>
                                <h3 class="text-lg font-semibold mb-2">{t("ApiToken")}</h3>
                                <Button onClick={handleGenerateApiToken} class="w-full sm:w-auto text-nowrap">
                                    {t("GenerateApiToken")}
                                </Button>
                            </div>
                            <div class="grid gap-4 md:grid-cols-3">
                                <IntegrationCard
                                    title="Salesforce"
                                    description={t("SalesforceIntegrationDescription")}
                                    connected={salesforceConnected()}
                                    onToggle={handleSalesforceIntegration}
                                    loading={salesforceConnected.loading}
                                />
                                <IntegrationCard
                                    title="Jira"
                                    description={t("JiraIntegrationDescription")}
                                    connected={jiraConnected()}
                                    onToggle={handleJiraIntegration}
                                />
                                <IntegrationCard
                                    title="Odoo"
                                    description={t("OdooIntegrationDescription")}
                                    connected={odooConnected()}
                                    onToggle={handleOdooIntegration}
                                />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="tickets">
                        <div class="space-y-6">
                            <h3 class="text-lg font-semibold mb-2">{t("YourJiraTickets")}</h3>
                            {/* Add Jira tickets list component here */}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter>
                <Show when={update.data.error}>
                    <div class="text-red-500 flex items-center">
                        <AlertCircle class="w-4 h-4 mr-2"/>
                        {update.data.error.detail}
                    </div>
                </Show>
            </CardFooter>

            <Dialog open={showSalesforceDialog()} onOpenChange={setShowSalesforceDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("SalesforceIntegration")}</DialogTitle>
                        <DialogDescription>{t("CreateSalesforceAccountDescription")}</DialogDescription>
                    </DialogHeader>
                    <SalesforceForm
                        user={props.user}
                        onResult={(connected) => {
                            setShowSalesforceDialog(false);
                            setSalesforceConnected(connected);
                        }}
                        onCancel={() => setShowSalesforceDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={showJiraDialog()} onOpenChange={setShowJiraDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("CreateJiraTicket")}</DialogTitle>
                        <DialogDescription>{t("CreateJiraTicketDescription")}</DialogDescription>
                    </DialogHeader>
                    {/* Add Jira ticket creation form here */}
                    <DialogFooter>
                        <Button onClick={() => setShowJiraDialog(false)}>{t("Cancel")}</Button>
                        <Button
                            onClick={() => {
                                setShowJiraDialog(false);
                                setJiraConnected(true);
                                showToast({title: t("JiraConnected"), variant: "success"});
                            }}
                        >
                            {t("CreateTicket")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

interface IntegrationCardProps {
    title: string;
    description: string;
    connected?: boolean;
    loading: boolean;
    onToggle: () => void;
}

function IntegrationCard(props: IntegrationCardProps) {
    const {t} = useLanguage();

    return (
        <Card class="flex flex-col justify-between">
            <CardContent class="pt-6">
                <h4 class="text-lg font-semibold mb-2">{props.title}</h4>
                <p class="text-sm text-muted-foreground mb-4">{props.description}</p>
            </CardContent>
            
            <CardFooter class="flex justify-between items-center">
                <Show when={!props.loading} fallback = {<Oval width="24" height="24"/>}> 
                    <div class="flex items-center">
                        {props.connected ? (
                            <Check class="w-5 h-5 text-green-500 mr-2"/>
                        ) : (
                            <X class="w-5 h-5 text-red-500 mr-2"/>
                        )}
                        <span class={props.connected ? "text-green-500" : "text-red-500"}>
                            {props.connected ? t("Connected") : t("Disconnected")}
                        </span>
                    </div>
                    <Button onClick={props.onToggle} variant={props.connected ? "destructive" : "default"}>
                        {props.connected ? t("Disconnect") : t("Connect")}
                    </Button>
                </Show>

            </CardFooter>
        </Card>
    );
}

export default UserProfile;