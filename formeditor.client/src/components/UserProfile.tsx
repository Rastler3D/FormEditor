import {createSignal, createEffect, Show, on} from 'solid-js';
import {Button} from '~/components/ui/button';
import { User} from '~/contexts/AuthContext';
import {Card, CardContent, CardHeader, CardTitle} from '~/components/ui/card';
import {Avatar, AvatarImage, AvatarFallback} from '~/components/ui/avatar';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {Label} from '~/components/ui/label';
import {TextField, TextFieldInput, TextFieldLabel} from './ui/text-field';
import {createWritableMemo} from "@solid-primitives/memo";
import {UpdateUser} from "~/types/template.ts";

interface UserProfileProps {
    isReadonly: boolean;
    user: User;
    onUserUpdate: (user: UpdateUser) => void;
}

function UserProfile(props: UserProfileProps) {
    const [name, setName] = createWritableMemo(() => props.user.name);
    const [email, setEmail] = createWritableMemo(() => props.user.name);
    const [avatar, setAvatar] = createWritableMemo(() => props.user.avatar);
    const [isEdit, setIsEdit] = createSignal(false);

    const previewAvatar = (avatar: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setAvatar(e.target?.result as string);
        reader.readAsDataURL(avatar);
    };

    const handleChangeAvatar = async (avatar: File | null) => {
        if (avatar){
            previewAvatar(avatar)
            props.onUserUpdate({avatar: avatar})
        }
    };

    const handleEditProfile= () => {
        setIsEdit(true);
    }
    const handleCancelEditProfile= () => {
        setName(props.user.name);
        setEmail(props.user.email);
        setIsEdit(false);
    }

    const handleSubmit = () => {
        setIsEdit(false);
        props.onUserUpdate({
            name: name(),
            email: email(),
        })
    }

    createEffect(on(()=> props.user), () => setIsEdit(false));

    return (
        <div class="container mx-auto p-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle class="text-3xl font-bold">User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="flex flex-col md:flex-row gap-8">
                        <div class="flex-shrink-0 flex flex-col items-center space-y-4">
                            <Avatar class="w-32 h-32">
                                <Show when={avatar()}
                                      fallback={<AvatarFallback>{name()}</AvatarFallback>}>
                                    <AvatarImage src={avatar()} alt={name()}/>
                                </Show>
                            </Avatar>
                            <Show when={!props.isReadonly}>
                                <Label for="avatar-upload" class="cursor-pointer">
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        class="hidden"
                                        readOnly={props.isReadonly}
                                        onChange={(e) => handleChangeAvatar(e.currentTarget.files?.[0] || null)}
                                    />
                                    <Button variant="outline" type="button">Change Avatar</Button>
                                </Label>
                            </Show>
                        </div>
                        <div class="flex-grow">
                            <Tabs defaultValue="profile" class="w-full">
                                <TabsList>
                                    <TabsTrigger value="profile">Profile</TabsTrigger>
                                    {/*<TabsTrigger value="security">Security</TabsTrigger>*/}
                                </TabsList>
                                <TabsContent value="profile">
                                    <div class="space-y-4">
                                        <div>
                                            <TextField value={name()} onChange={(value) => setName(value)}
                                                       readOnly={props.isReadonly || !isEdit()}>
                                                <TextFieldLabel for="name">Name</TextFieldLabel>
                                                <TextFieldInput id="name" type="text" required/>
                                            </TextField>
                                        </div>
                                        <div>
                                            <TextField value={email()} onChange={(value) => setEmail(value)}
                                                       readOnly={props.isReadonly || !isEdit()}>
                                                <TextFieldLabel for="name">Email</TextFieldLabel>
                                                <TextFieldInput id="email" type="email" required/>
                                            </TextField>
                                        </div>
                                        <Show when={!props.isReadonly}>
                                            <Show when={isEdit()} fallback={
                                                <Button onClick={handleEditProfile}>Edit Profile</Button>
                                            }>
                                                <Button onSubmit={handleCancelEditProfile}>Cancel</Button>
                                                <Button onSubmit={handleSubmit}>Update Profile</Button>
                                            </Show>
                                            <Button type="submit">Update Profile</Button>
                                        </Show>
                                    </div>
                                </TabsContent>
                                {/*<TabsContent value="security">*/}
                                {/*    <div class="space-y-4">*/}
                                {/*        <Button >*/}
                                {/*            Reset Password*/}
                                {/*        </Button>*/}
                                {/*        <Button variant="outline" >*/}
                                {/*            Enable Two-Factor Authentication*/}
                                {/*        </Button>*/}
                                {/*    </div>*/}
                                {/*</TabsContent>*/}
                            </Tabs>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default UserProfile;