import {Show} from "solid-js";
import {Card, CardContent} from "~/components/ui/card";
import {createWritableMemo} from "@solid-primitives/memo";
import {User} from "~/contexts/AuthContext";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import {useLanguage} from "~/contexts/LanguageContext";
import ProfileHeader from "~/components/ProfileHeader.tsx";
import ProfileInfo from "~/components/ProfileInfo.tsx";
import IntegrationsManager from "~/components/IntegrationsManager.tsx";
import TicketManagement from "~/components/TicketManagement.tsx";

interface UserProfileProps {
    isReadonly: boolean;
    user: User;
    onUserUpdated: (user: User) => void;
}

function UserProfile(props: UserProfileProps) {
    const [avatar, setAvatar] = createWritableMemo(() => props.user.avatar);
    const {t} = useLanguage();

    return (
        <Card class="w-full max-w-4xl mx-auto overflow-hidden">
            <CardContent class="p-6">
                <ProfileHeader name={props.user.name} avatar={avatar()}/>
                <Show when={!props.isReadonly} fallback={
                    <ProfileInfo
                        isReadonly={props.isReadonly}
                        onPreviewAvatar={setAvatar}
                        user={props.user}
                        onUserUpdated={props.onUserUpdated}
                    />
                }>
                    <Tabs defaultValue="profile" class="w-full">
                        <TabsList class="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">{t("Profile")}</TabsTrigger>
                            <TabsTrigger value="integrations">{t("Integrations")}</TabsTrigger>
                            <TabsTrigger value="tickets">{t("Tickets")}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile">
                            <ProfileInfo
                                isReadonly={props.isReadonly}
                                onPreviewAvatar={setAvatar}
                                user={props.user}
                                onUserUpdated={props.onUserUpdated}
                            />
                        </TabsContent>
                        <TabsContent value="integrations">
                            <IntegrationsManager
                                user={props.user}
                            />
                        </TabsContent>
                        <TabsContent value="tickets">
                            <TicketManagement/>
                        </TabsContent>
                    </Tabs>
                </Show>
            </CardContent>
        </Card>
    );
}


export default UserProfile;