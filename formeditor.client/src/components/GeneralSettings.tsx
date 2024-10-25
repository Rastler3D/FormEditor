import {createResource, createSignal, Show} from 'solid-js';
import {AccessSetting, TemplateConfiguration} from '~/types/template';
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {Button} from "~/components/ui/button";
import MarkdownEditor from '~/components/MarkdownEditor';
import ImageUploader from '~/components/ImageUploader';
import TagSelector from '~/components/TagSelector';
import {Label} from "~/components/ui/label.tsx";
import UserTableList from "~/components/UserSelection.tsx";
import {fetchTags, fetchTopics} from "~/services/templateService.ts";
import {Card, CardContent, CardHeader} from "~/components/ui/card.tsx";
import {
    Combobox,
    ComboboxContent,
    ComboboxControl,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxItemLabel, ComboboxTrigger
} from "~/components/ui/combobox.tsx";

interface GeneralSettingsProps {
    template: TemplateConfiguration;
    updateTemplate: <T extends keyof TemplateConfiguration>(field: T, value: TemplateConfiguration[T]) => void;
}

export default function GeneralSettings(props: GeneralSettingsProps) {
    const [showUserTableList, setShowUserTableList] = createSignal(false);
    const [topics] = createResource(fetchTopics);
    const [tags] = createResource(fetchTags);

    const updateSelectedUsers = (users: number[]) => {
        props.updateTemplate("allowList", users);
        setShowUserTableList(false);
    };

    const updateAccessSettings = (accessSettings: AccessSetting) => {
        if (accessSettings === AccessSetting.All) {
            props.updateTemplate("allowList", undefined);
        } else {
            props.updateTemplate("allowList", []);
        }
        props.updateTemplate("accessSetting", accessSettings);
    };

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <div class="space-y-6">
                <CardHeader>
                    <h2 class="text-2xl font-bold">General Settings</h2>
                </CardHeader>
                <CardContent>
                    <div class="space-y-8 ">
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="sm:col-span-2">
                                <Label for="title" class="text-lg font-semibold mb-2">Title</Label>
                                <TextField
                                    required
                                    value={props.template.name}
                                    onChange={(value) => props.updateTemplate("name", value)}
                                >
                                    <TextFieldInput
                                        type="text"
                                        id="title"
                                        class="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring"
                                    />
                                </TextField>
                            </div>
                            <div class="sm:col-span-2">
                                <Label for="description" class="text-lg font-semibold mb-2">Description</Label>
                                <MarkdownEditor
                                    required
                                    id="description"
                                    value={props.template.description}
                                    onChange={(value) => props.updateTemplate("description", value)}
                                />
                            </div>
                            <div class="sm:col-span-2">
                                <Label for="topics" class="text-lg font-semibold mb-2">Topic</Label>
                                <Combobox<string>
                                    id="topics"
                                    options={(topics()?.length > 0) ? topics()! : ["Education", "Quiz"]}
                                    value={props.template.topic}
                                    onChange={(value) => props.updateTemplate("topic", value ?? "Education")}
                                    placeholder="Select tags"
                                    itemComponent={(props) => (
                                        <ComboboxItem item={props.item} class="p-2 cursor-pointer hover:bg-accent">
                                            <ComboboxItemLabel>{props.item.rawValue}</ComboboxItemLabel>
                                            <ComboboxItemIndicator/>
                                        </ComboboxItem>
                                    )}
                                >
                                    <ComboboxControl aria-label="Topic"
                                                     class="flex items-center text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full px-2 text-left  rounded shadow-sm has-[:focus]:outline-none has-[:focus]:ring-2 has-[:focus]:ring-primary">
                                        <ComboboxInput class=""/>
                                        <ComboboxTrigger class=""/>
                                    </ComboboxControl>
                                    <ComboboxContent class="bg-popover border border-border rounded-md shadow-md"/>
                                </Combobox>
                            </div>
                            <div class="sm:col-span-2">
                                <Label for="image" class="text-lg font-semibold mb-2">Image</Label>
                                <ImageUploader
                                    id="image"
                                    image={props.template.image}
                                    onImageChange={(image) => props.updateTemplate("image", image)}
                                />
                            </div>
                            <div class="sm:col-span-2">
                                <Label for="tags" class="text-lg font-semibold mb-2">Tags</Label>
                                <TagSelector
                                    id="tags"
                                    tagOptions={tags() ?? []}
                                    tags={props.template.tags}
                                    onTagsChange={(tags) => props.updateTemplate("tags", tags)}
                                />
                            </div>
                            <div class="sm:col-span-2">
                                <Label for="access-setting" class="text-lg font-semibold mb-2">Access Setting</Label>
                                <Select
                                    id="access-setting"
                                    value={props.template.accessSetting}
                                    required
                                    onChange={(value) => updateAccessSettings(value ?? AccessSetting.All)}
                                    options={Object.values(AccessSetting)}
                                    itemComponent={(props) => (
                                        <SelectItem item={props.item}>
                                            {props.item.rawValue === AccessSetting.Specified ? 'Specified users only' : 'Public'}
                                        </SelectItem>
                                    )}
                                >
                                    <SelectTrigger id="access-setting"
                                                   class="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring">
                                        <SelectValue>{(state) => state.selectedOption() === AccessSetting.Specified ? 'Specified users only' : 'Public'}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent class="bg-popover border border-border rounded-md shadow-md"/>
                                </Select>
                            </div>
                            <Show when={props.template.accessSetting === AccessSetting.Specified}>
                                <div class="sm:col-span-2">
                                    <Label for="users" class="text-lg font-semibold mb-2">Users</Label>
                                    <Button id="users" onClick={() => setShowUserTableList(true)} variant="outline"
                                            class="w-full">
                                        Select Users
                                    </Button>
                                    <div class="mt-2 text-sm text-muted-foreground">
                                        <p>{props.template.allowList?.length} users selected</p>
                                    </div>
                                </div>
                            </Show>
                        </div>
                        <Show when={showUserTableList()}>
                            <UserTableList
                                onClose={() => setShowUserTableList(false)}
                                onSave={updateSelectedUsers}
                                initialSelectedUsers={props.template.allowList ?? []}
                            />
                        </Show>
                    </div>
                </CardContent>
            </div>
        </Card>

    );
}