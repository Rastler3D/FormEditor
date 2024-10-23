import {createEffect, createMemo, on, Show} from 'solid-js';
import {BiSolidCog} from 'solid-icons/bi';
import {FaSolidPencil, FaSolidEye} from 'solid-icons/fa';
import {Card} from "~/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import {QuestionConfiguration, TemplateConfiguration} from '~/types/template';
import GeneralSettings from '~/components/GeneralSettings';
import QuestionEditor from '~/components/QuestionEditor';
import TemplateView from '~/components/TemplateView';
import {Button} from "~/components/ui/button.tsx";
import {ProgressCircle} from "~/components/ui/progress-circle.tsx";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import {useAuth} from "~/contexts/AuthContext.tsx";

interface TemplateSettingsProps {
    template: TemplateConfiguration;
    onSaveChanges: (selectedUsers: TemplateConfiguration) => void;
    isSavingChanges: boolean;
}

export default function TemplateSettings(props: TemplateSettingsProps) {
    const [template, setTemplate] = createStore(props.template);
    const {user} = useAuth();
    const filledBy = createMemo(() => user()?.name ?? "Anonymous");
    const fillingDate= createMemo(on(()=> props.template,() => new Date()));
    const updateTemplate = <T extends keyof TemplateConfiguration>(field: T, value: TemplateConfiguration[T]) => {
        setTemplate(field, reconcile(value));
    };
    const updateQuestion = <T extends keyof QuestionConfiguration>(index: number, field: T, value: QuestionConfiguration[T]) => {
        setTemplate("questions", index, field, reconcile(value));
    };

    const changeQuestions = (questions: QuestionConfiguration[]) => {
        setTemplate("questions", reconcile(questions));
    };

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        props.onSaveChanges(unwrap(template));
    }
    
    createEffect(on(()=>props.template, (template)=> setTemplate(reconcile(template))))

    return (
        <div class="container mx-auto p-4 bg-background text-foreground min-h-screen">
            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="general">
                    <TabsList class="flex border-b border-border mb-4">
                        <TabsTrigger
                            value="general"
                            class="flex-1 py-2 px-4 text-center hover:bg-accent transition-colors duration-200"

                        >
                            <BiSolidCog class="inline-block mr-2"/>
                            General Settings
                        </TabsTrigger>
                        <TabsTrigger
                            value="edit"
                            class="flex-1 py-2 px-4 text-center hover:bg-accent transition-colors duration-200"

                        >
                            <FaSolidPencil class="inline-block mr-2"/>
                            Question Editor
                        </TabsTrigger>
                        <TabsTrigger
                            value="preview"
                            class="flex-1 py-2 px-4 text-center hover:bg-accent transition-colors duration-200"
                        >
                            <FaSolidEye class="inline-block mr-2"/>
                            Preview
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" class="p-6">
                        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
                            <GeneralSettings
                                template={template}
                                updateTemplate={updateTemplate}
                            />
                        </Card>
                    </TabsContent>
                    <TabsContent value="edit" class="p-6">
                        <QuestionEditor
                            questions={template.questions}
                            updateQuestion={updateQuestion}
                            changeQuestions={changeQuestions}
                        />
                    </TabsContent>
                    <TabsContent value="preview" class="p-6">
                        <TemplateView template={template} fillingDate={fillingDate()} filledBy={filledBy()}/>
                    </TabsContent>
                </Tabs>
                <Show when={props.isSavingChanges} fallback={
                    <Button disabled class="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Loading <Oval width="24" height="24" />
                    </Button>
                }>
                    <Button type="submit"
                            class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >{"id" in props.template ? "Save" : "Create"}</Button>
                </Show>
            </form>
        </div>
    );
}