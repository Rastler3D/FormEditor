import {useParams} from "@solidjs/router";
import {createResource, Show} from "solid-js";
import UserProfile from "~/components/UserProfile";
import {useAuth} from "~/contexts/AuthContext";
import {fetchUser} from "~/services/userService";
import {ProgressCircle} from "~/components/ui/progress-circle.tsx";

const UserPage = () => {
    const params = useParams();
    const {user: currentUser, updateUser} = useAuth();
    const [user, {mutate}] = createResource(() => Number(params.userId), fetchUser);

    return (
        <Show when={!user.error} fallback={
            <div class="m-auto">User not found.</div>
        }>
            <Show when={user()} fallback={
                <div class="m-auto"> Loading <ProgressCircle showAnimation={true}></ProgressCircle></div>
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