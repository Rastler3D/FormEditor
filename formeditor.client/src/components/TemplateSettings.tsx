import { createSignal, createMemo, Show } from 'solid-js';
import { BiSolidCog } from 'solid-icons/bi';
import { FaSolidPencil, FaSolidEye } from 'solid-icons/fa';
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Template } from '~/types/template';
import GeneralSettings from '~/components/GeneralSettings';
import QuestionEditor from '~/components/QuestionEditor';
import TemplateView from '~/components/TemplateView';
import UserTableList from '~/components/UserTableList';

interface TemplateSettingsProps {
    template: Template;
}

export default function TemplateSettings(props: TemplateSettingsProps) {
    const [template, setTemplate] = createSignal<Template | null>(props.template);
    const [activeTab, setActiveTab] = createSignal('general');
    const [showUserTableList, setShowUserTableList] = createSignal(false);
    const [selectedUsers, setSelectedUsers] = createSignal<number[]>([]);

    const updateTemplate = (updates: Partial<Template>) => {
        setTemplate(prev => ({...prev!, ...updates}));
    };

    const handleSaveSelectedUsers = (users: number[]) => {
        setSelectedUsers(users);
        setShowUserTableList(false);
    };

    const selectedUsersDetails = createMemo(() => {
        // This is a mock function. In a real application, you would fetch user details from your backend.
        return selectedUsers().map(id => ({id, name: `User ${id}`, role: 'Member'}));
    });

    return (
        <div class="container mx-auto p-4 bg-background text-foreground min-h-screen">
            <Tabs value={activeTab()} onChange={setActiveTab}>
                <TabsList class="flex border-b border-border mb-4">
                    <TabsTrigger
                        value="general"
                        class="flex-1 py-2 px-4 text-center hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
                        classList={{'bg-accent': activeTab() === 'general'}}
                    >
                        <BiSolidCog class="inline-block mr-2"/>
                        General Settings
                    </TabsTrigger>
                    <TabsTrigger
                        value="edit"
                        class="flex-1 py-2 px-4 text-center hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
                        classList={{'bg-accent': activeTab() === 'edit'}}
                    >
                        <FaSolidPencil class="inline-block mr-2"/>
                        Edit
                    </TabsTrigger>
                    <TabsTrigger
                        value="preview"
                        class="flex-1 py-2 px-4 text-center hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
                        classList={{'bg-accent': activeTab() === 'preview'}}
                    >
                        <FaSolidEye class="inline-block mr-2"/>
                        Preview
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="general" class="p-6">
                    <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
                        <GeneralSettings
                            template={template()!}
                            updateTemplate={updateTemplate}
                            showUserTableList={() => setShowUserTableList(true)}
                            selectedUsers={selectedUsers}
                            selectedUsersDetails={selectedUsersDetails}
                        />
                    </Card>
                </TabsContent>
                <TabsContent value="edit" class="p-6">
                    <QuestionEditor
                        questions={template()!.questions}
                        onQuestionsChange={(questions) => updateTemplate({questions})}
                    />
                </TabsContent>
                <TabsContent value="preview" class="p-6">
                    <TemplateView template={template()!}/>
                </TabsContent>
            </Tabs>
            <Show when={showUserTableList()}>
                <UserTableList
                    onClose={() => setShowUserTableList(false)}
                    onSave={handleSaveSelectedUsers}
                    initialSelectedUsers={selectedUsers()}
                />
            </Show>
        </div>
    );
}