import {createEffect, createMemo, on, Show} from 'solid-js';
import {BiSolidCog} from 'solid-icons/bi';
import {FaSolidPencil, FaSolidEye} from 'solid-icons/fa';
import {Card, CardContent} from "~/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import {QuestionConfiguration, TemplateConfiguration} from '~/types/template';
import GeneralSettings from '~/components/GeneralSettings';
import QuestionEditor from '~/components/QuestionEditor';
import TemplateView from '~/components/TemplateView';
import {Button} from "~/components/ui/button.tsx";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import {useAuth} from "~/contexts/AuthContext.tsx";
import { Oval } from 'solid-spinner';
import {Settings, Pencil, Eye} from "lucide-solid";

interface TemplateSettingsProps {
    template: TemplateConfiguration;
    onSaveChanges: (selectedUsers: TemplateConfiguration) => void;
    isSavingChanges: boolean;
}

export default function TemplateSettings(props: TemplateSettingsProps) {
    const [template, setTemplate] = createStore(props.template);
    const { user } = useAuth();
    const filledBy = createMemo(() => user()?.name ?? "Anonymous");
    const fillingDate = createMemo(on(() => props.template, () => new Date()));

    const updateTemplate = <T extends keyof TemplateConfiguration>(field: T, value: TemplateConfiguration[T]) => {
        setTemplate(field, reconcile(value));
    };

    const updateQuestion = <T extends keyof QuestionConfiguration>(index: number, field: T, value: QuestionConfiguration[T]) => {
        console.log(index, field, value);
        setTemplate("questions", index, field, reconcile(value));
    };

    const changeQuestions = (questions: QuestionConfiguration[]) => {
        console.log(questions);
        setTemplate("questions", questions);
    };

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        props.onSaveChanges(unwrap(template));
    }

    createEffect(on(() => props.template, (template) => setTemplate(reconcile(template))))

    return (
        <div class="rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} class="space-y-6">
                <Tabs defaultValue="general" class="w-full">
                    <TabsList class="flex w-full border-b border-border mb-4 overflow-x-auto overflow-y-hidden">
                        <TabsTrigger
                            value="general"
                            class="flex-1 py-2 px-4 text-center hover:bg-accent transition-colors duration-200 whitespace-nowrap"
                        >
                            <Settings class="w-4 h-4 inline-block mr-2" />
                            <span class="hidden sm:inline">General Settings</span>
                            <span class="sm:hidden">General</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="edit"
                            class="flex-1 py-2 px-4 text-center hover:bg-accent transition-colors duration-200 whitespace-nowrap"
                        >
                            <Pencil class="w-4 h-4 inline-block mr-2" />
                            <span class="hidden sm:inline">Question Editor</span>
                            <span class="sm:hidden">Questions</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="preview"
                            class="flex-1 py-2 px-4 text-center hover:bg-accent transition-colors duration-200 whitespace-nowrap"
                        >
                            <Eye class="w-4 h-4 inline-block mr-2" />
                            Preview
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <GeneralSettings
                            template={template}
                            updateTemplate={updateTemplate}
                        />
                    </TabsContent>
                    <TabsContent value="edit">
                        <QuestionEditor
                            questions={template.questions}
                            updateQuestion={updateQuestion}
                            changeQuestions={changeQuestions}
                        />
                    </TabsContent>
                    <TabsContent value="preview">
                        <TemplateView template={template} fillingDate={fillingDate()} filledBy={filledBy()} />
                    </TabsContent>
                </Tabs>
                <div class="flex justify-end">
                    <Show
                        when={!props.isSavingChanges}
                        fallback={
                            <Button disabled class="w-full sm:w-40 bg-primary text-primary-foreground">
                                <Oval width="20" height="20" class="mr-2" />
                                Saving...
                            </Button>
                        }
                    >
                        <Button type="submit" class="w-full sm:w-40 bg-primary text-primary-foreground hover:bg-primary/90">
                            {"id" in props.template ? "Save Changes" : "Create Template"}
                        </Button>
                    </Show>
                </div>
            </form>
        </div>
    );
}