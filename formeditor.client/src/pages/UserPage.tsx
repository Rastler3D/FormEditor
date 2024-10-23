import {useParams} from "@solidjs/router";
import {createResource, Show} from "solid-js";
import { Oval } from "solid-spinner";
import UserProfile from "~/components/UserProfile";
import {useAuth} from "~/contexts/AuthContext";
import {getUser} from "~/services/userService";


const UserPage = () => {
    const params = useParams();
    const {user: currentUser, updateUser} = useAuth();
    const [user, {mutate}] = createResource(() => Number(params.userId), getUser);

    return (
        <Show when={!user.error} fallback={
            <div class="m-auto">User not found.</div>
        }>
            <Show when={user()} fallback={
                <div class="m-auto"> Loading <Oval width="64" height="64" /></div>
            }>
                <UserProfile
                    user={user()!}
                    isReadonly={user()?.id != currentUser()?.id}
                    onUserUpdate={user => updateUser(user).then(user => mutate(currentUser => currentUser?.id == user.id ? user : currentUser))}
                />
            </Show>
        </Show>

    )
}

export default UserPage;