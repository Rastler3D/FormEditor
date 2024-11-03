import {createEffect, createSignal, Show} from "solid-js";
import {Label} from "~/components/ui/label";
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Button} from "~/components/ui/button";
import {Oval} from "solid-spinner";
import {useLanguage} from "~/contexts/LanguageContext";
import {UserIcon, Mail, Camera, AlertCircle} from "lucide-solid";
import {createAction, resolve} from "~/lib/action.ts";
import {User} from "~/contexts/AuthContext.tsx";
import {createWritableMemo} from "@solid-primitives/memo";
import {updateUser} from "~/services/userService.ts";

interface ProfileInfoProps {
    user: User;
    isReadonly: boolean;
    onUserUpdated: (user: User) => void;
    onPreviewAvatar: (avatar?: string) => void;
}

function ProfileInfo(props: ProfileInfoProps) {
    const {t} = useLanguage();
    const [name, setName] = createWritableMemo(() => props.user.name);
    const [email, setEmail] = createWritableMemo(() => props.user.email);
    const [isEdit, setIsEdit] = createSignal(false);
    const update = createAction(updateUser, () => props.user.id);

    const handleSubmit = () => {
        update({
            userId: props.user.id,
            user: {
                name: name(),
                email:
                    email(),
            }
        });
    };

    const handleCancelEditProfile = () => {
        setName(props.user.name);
        setEmail(props.user.email);
        setIsEdit(false);
    };

    const previewAvatar = (avatar: File) => {
        const reader = new FileReader();
        reader.onload = (e) => props.onPreviewAvatar(e.target?.result as string);
        reader.readAsDataURL(avatar);
    };

    const handleChangeAvatar = async (avatar: File | null) => {
        if (avatar) {
            previewAvatar(avatar)
            update({
                userId: props.user.id,
                user: {avatar: avatar}
            });
        }
    };

    createEffect(resolve(update.data, (user) => props.onUserUpdated(user)));
    createEffect(() => {
        if (update.data.error) {
            setName(props.user.name);
            setEmail(props.user.email);
            props.onPreviewAvatar(props.user.avatar);
        }
    });

    createEffect(() => {
        if (props.user) {
            setIsEdit(false);
        }
    });

    return (
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
                <Show when={update.data.error}>
                    <div class="text-red-500 flex items-center">
                        <AlertCircle class="w-4 h-4 mr-2"/>
                        {update.data.error.detail}
                    </div>
                </Show>
                <Show when={!props.isReadonly}>
                    <Show
                        when={isEdit()}
                        fallback={
                            <Button onClick={() => setIsEdit(true)} class="w-full sm:w-auto text-nowrap">
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
                                {update.data.loading ? <Oval width="24" height="24"/> : t("UpdateProfile")}
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
    );
}

export default ProfileInfo;