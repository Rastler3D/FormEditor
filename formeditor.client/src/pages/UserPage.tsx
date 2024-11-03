import {useParams} from "@solidjs/router";
import {createResource, Show} from "solid-js";
import {Oval} from "solid-spinner";
import UserProfile from "~/components/UserProfile";
import {useAuth} from "~/contexts/AuthContext";
import {getUser} from "~/services/userService";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import {AlertCircle, UserX} from "lucide-solid";
import {Alert, AlertDescription, AlertTitle} from "~/components/ui/alert.tsx";


const UserPage = () => {
    const params = useParams();
    const {user: currentUser} = useAuth();
    const [user, {mutate}] = createResource(() => Number(params.id), getUser);

    return (
        <div class="container mx-auto p-4 max-w-4xl">
            <Show
                when={!user.error}
                fallback={
                    <Card class="mt-8">
                        <CardHeader>
                            <CardTitle class="text-2xl font-bold flex items-center gap-2">
                                <UserX size={24}/>
                                User Not Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert variant="destructive">
                                <AlertCircle class="h-4 w-4"/>
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    The requested user profile could not be found. Please check the URL and try again.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                }
            >
                <Show when={user()} fallback={
                    <div class="flex justify-center items-baseline w-full h-full mt-28"><Oval width="64" height="64"/>
                    </div>
                }>
                    <UserProfile
                        user={user()!}
                        isReadonly={!user() || (user()?.id != currentUser()?.id && user()?.role != 'Admin')}
                        onUserUpdated={user => mutate(currentUser => currentUser?.id == user.id ? user : currentUser)}
                    />
                </Show>
            </Show>
        </div>

    )
}

export default UserPage;