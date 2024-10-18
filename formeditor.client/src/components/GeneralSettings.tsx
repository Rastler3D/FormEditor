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
import {fetchTags, fetchTopics} from "~/services/api.ts";

interface GeneralSettingsProps {
    template: TemplateConfiguration;
    updateTemplate: <T extends keyof TemplateConfiguration>(field: T, value: TemplateConfiguration[T]) => void;
}

export default function GeneralSettings(props: GeneralSettingsProps) {
    const [showUserTableList, setShowUserTableList] = createSignal(false);
    const [topics] = createResource(fetchTopics);
    const [tags] = createResource(fetchTags);

    const updateSelectedUsers = (users: number[]) => {
        props.updateTemplate("allowList", users)
        setShowUserTableList(false);
    };

    const updateAccessSettings = (accessSettings: AccessSetting) => {
        if (accessSettings === AccessSetting.All) {
            props.updateTemplate("allowList", undefined)
        } else {
            props.updateTemplate("allowList", [])
        }
        props.updateTemplate("accessSetting", accessSettings)
    };

    return (
        <div class="space-y-6">
            <div>
                <Label for="title">Description</Label>
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
            <div>
                <Label for="topics">Description</Label>
                <MarkdownEditor
                    required
                    id="description"
                    value={props.template.description}
                    onChange={(value) => props.updateTemplate("description", value)}
                />
            </div>
            <div>
                <Label for="topics">Access Setting</Label>
                <Select
                    id="topics"
                    required
                    value={props.template.topic}
                    onChange={(value) => props.updateTemplate("topic", value ?? "Education")}
                    options={topics() ?? []}
                    itemComponent={(props) => (
                        <SelectItem item={props.item} class="p-2 cursor-pointer hover:bg-accent">
                            <SelectValue>{props.item.rawValue}</SelectValue>
                        </SelectItem>
                    )}
                >
                    <SelectTrigger
                        class="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring">
                        <SelectValue>{props.template.topic}</SelectValue>
                    </SelectTrigger>
                    <SelectContent class="bg-popover border border-border rounded-md shadow-md"/>
                </Select>
            </div>
            <div>
                <Label for="image">Image</Label>
                <ImageUploader
                    id="image"
                    image={props.template.image}
                    onImageChange={(image) => props.updateTemplate("image", image)}
                />
            </div>
            <div>
                <Label for="tags">Tags</Label>
                <TagSelector
                    id="tags"
                    tagOptions={tags() ?? []}
                    tags={props.template.tags}
                    onTagsChange={(tags) => props.updateTemplate("tags", tags)}
                />
            </div>

            <div>
                <Label for="access-setting">Access Setting</Label>
                <Select
                    id="access-setting"
                    value={props.template.accessSetting}
                    required
                    onChange={(value) => updateAccessSettings(value ?? AccessSetting.All)}
                    options={Object.values(AccessSetting)}
                    itemComponent={(props) => (
                        <SelectItem item={props.item}>
                            {props.item.rawValue === AccessSetting.All ? 'Public' : 'Specified users only'}
                        </SelectItem>
                    )}
                >
                    <SelectTrigger id="access-setting"
                                   class="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring">
                        <SelectValue>{(state) => state.selectedOption() === 'all' ? 'Public' : 'Specified users only'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent class="bg-popover border border-border rounded-md shadow-md"/>
                </Select>
            </div>
            <Show when={props.template.accessSetting === AccessSetting.Specified}>
                <div>
                    <Label for="users">Users</Label>
                    <Button id="users" onClick={() => setShowUserTableList(true)} variant="outline">Select
                        Users</Button>
                    <div class="mt-2 text-sm text-muted-foreground">
                        <p>{props.template.allowList?.length} users selected</p>
                    </div>
                </div>
            </Show>
            <Show when={showUserTableList()}>
                <UserTableList
                    onClose={() => setShowUserTableList(false)}
                    onSave={updateSelectedUsers}
                    initialSelectedUsers={props.template.allowList ?? []}
                />
            </Show>

        </div>
    );
}