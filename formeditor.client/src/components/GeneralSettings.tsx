import {For, Show} from 'solid-js';
import {Template} from '~/types/template';
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {Button} from "~/components/ui/button";
import {TopicOptions} from '~/types/template';
import MarkdownEditor from '~/components/MarkdownEditor';
import ImageUploader from '~/components/ImageUploader';
import TagSelector from '~/components/TagSelector';

interface GeneralSettingsProps {
    template: Template;
    updateTemplate: (updates: Partial<Template>) => void;
    showUserTableList: () => void;
    selectedUsers: () => number[];
    selectedUsersDetails: () => { name: string; role: string }[];
}

export default function GeneralSettings(props: GeneralSettingsProps) {
    return (
        <div class="space-y-6">
            <div>
                <label htmlFor="title" class="block text-sm font-medium mb-1">Title</label>
                <TextField>
                    <TextFieldInput
                        type="text"
                        id="title"
                        value={props.template.name}
                        onInput={(e) => props.updateTemplate({name: e.currentTarget.value})}
                        class="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring"
                    />
                </TextField>
            </div>
            <div>
                <label htmlFor="description" class="block text-sm font-medium mb-2">Description (Markdown
                    supported)</label>
                <MarkdownEditor
                    value={props.template.description}
                    onChange={(value) => props.updateTemplate({description: value})}
                />
            </div>
            <div>
                <label htmlFor="topic" class="block text-sm font-medium mb-1">Topic</label>
                <Select
                    value={props.template.topic}
                    onChange={(value) => props.updateTemplate({topic: value})}
                    options={TopicOptions.map((option) => option.label)}
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
            <ImageUploader
                image={props.template.image}
                onImageChange={(image) => props.updateTemplate({image})}
            />
            <TagSelector
                tags={props.template.tags}
                onTagsChange={(tags) => props.updateTemplate({tags})}
            />
            <div>
                <label htmlFor="access-setting" class="block text-sm font-medium mb-1">
                    Access Setting
                </label>
                <Select
                    value={props.template.accessSetting}
                    onChange={(value) => props.updateTemplate({accessSetting: value as 'all' | 'specified'})}
                    options={['all', 'specified']}
                    itemComponent={(props) => (
                        <SelectItem item={props.item}>
                            {props.item.rawValue === 'all' ? 'Public' : 'Specified users only'}
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
            <Show when={props.template.accessSetting === 'specified'}>
                <div>
                    <Button onClick={props.showUserTableList} variant="outline">Select Users</Button>
                    <div class="mt-2 text-sm text-muted-foreground">
                        <p>{props.selectedUsers().length} users selected</p>
                        <ul class="list-disc list-inside mt-2">
                            <For each={props.selectedUsersDetails().slice(0, 3)}>
                                {(user) => <li>{user.name} ({user.role})</li>}
                            </For>
                        </ul>
                        <Show when={props.selectedUsers().length > 3}>
                            <p>and {props.selectedUsers().length - 3} more...</p>
                        </Show>
                    </div>
                </div>
            </Show>
        </div>
    );
}