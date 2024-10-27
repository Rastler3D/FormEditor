import {createEffect, createSignal, on, Show} from "solid-js";
import {Card, CardContent, CardFooter} from "~/components/ui/card.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar.tsx";
import {AlertCircle, Camera, Mail, UserIcon} from "lucide-solid";
import {Label} from "~/components/ui/label.tsx";
import {TextField, TextFieldInput} from "~/components/ui/text-field.tsx";
import {Button} from "~/components/ui/button";
import {Alert, AlertDescription} from "~/components/ui/alert.tsx";
import {createWritableMemo} from "@solid-primitives/memo";
import {useAuth, User} from "~/contexts/AuthContext.tsx";
import {createAction, resolve} from "~/lib/action.ts";
import {Oval} from "solid-spinner";

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
    const {updateUser} = useAuth();
    const update = createAction(updateUser, () => props.user.id);

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
    createEffect(resolve(update.data, (user) => props.onUserUpdated(user)));
    createEffect(() => {
        if (update.data.error) {
            setName(props.user.name);
            setEmail(props.user.email);
            setAvatar(props.user.avatar);
        }
    })

    createEffect(on(() => props.user, () => setIsEdit(false)));

    return (
        <Card class="w-full max-w-xl mx-auto overflow-hidden">
            <div class="relative h-48 bg-primary/10">
                <div class="absolute inset-0"/>
            </div>
            <CardContent class="relative px-4 sm:px-6 lg:px-8 py-6 -mt-24">
                <div class="flex flex-col items-center">
                    <Avatar class="w-32 h-32 border-4 border-background shadow-xl">
                        <Show when={avatar()}
                              fallback={<AvatarFallback class="text-4xl ">{name().split(" ", 2).map((n) => n.charAt(0)).join("").toUpperCase()}</AvatarFallback>}>
                            <AvatarImage src={avatar()} alt={name()}/>
                        </Show>
                    </Avatar>
                    <h1 class="mt-4 text-3xl font-bold text-foreground">{name()}</h1>
                </div>
                <div class="mt-12 max-w-2xl mx-auto">
                    <Show
                        when={!props.isReadonly && isEdit()}
                        fallback={
                            <div class="space-y-6">
                                <div>
                                    <Label class="text-sm font-medium ">Name</Label>
                                    <div class="flex items-center mt-1 p-2 rounded-md">
                                        <UserIcon size={18} class="text-primary mr-2"/>
                                        <span class="text-lg">{name()}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label class="text-sm font-medium ">Email</Label>
                                    <div class="flex items-center mt-1 p-2 rounded-md">
                                        <Mail size={18} class="text-primary mr-2"/>
                                        <span class="text-lg">{email()}</span>
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <div class="space-y-6">
                            <TextField value={name()} onChange={(value) => setName(value)} readOnly={update.data.loading}>
                                <Label for="name">Name</Label>
                                <TextFieldInput id="name" type="text" required class="text-lg"/>
                            </TextField>
                            <TextField value={email()} onChange={(value) => setEmail(value)} readOnly={update.data.loading}>
                                <Label for="email">Email</Label>
                                <TextFieldInput id="email" type="email" required class="text-lg"/>
                            </TextField>
                        </div>
                    </Show>
                </div>
            </CardContent>
            <CardFooter>
                <div class="flex flex-col">
                    <Show when={update.data.error}>
                        <div class="text-red-500 flex items-center">
                            <AlertCircle class="w-4 h-4 mr-2"/>
                            {update.data.error.detail}
                        </div>
                    </Show>
                    <div class="mt-8 flex gap-3">
                        <Show when={!props.isReadonly}>
                            <Show when={isEdit()} fallback={
                                <Button onClick={handleEditProfile} class="w-full sm:w-auto text-nowrap">Edit
                                    Profile</Button>
                            }>
                                <div class="flex gap-3">
                                    <Button onClick={handleSubmit} disabled={update.data.loading}
                                            class="w-full sm:w-auto text-nowrap">
                                        {update.data.loading ?
                                            <Oval width="24" height="24"/> : "Update Profile"} </Button>
                                    <Button variant="outline" disabled={update.data.loading}
                                            onClick={handleCancelEditProfile}
                                            class="w-full sm:w-auto text-nowrap">Cancel</Button>
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
                                <Button as={"span"} variant="outline" type="button"
                                        class="w-full sm:w-auto flex items-center justify-center gap-2 text-nowrap">
                                    <Camera size={16}/>
                                    Change Avatar
                                </Button>
                            </Label>
                        </Show>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

export default UserProfile;