import {Tabs, TabsList, TabsTrigger, TabsContent} from "~/components/ui/tabs";
import TemplateSettings from "~/components/TemplateSettings";
import {Template, TemplateConfiguration} from "~/types/types.ts";
import TemplateSubmission from "~/components/TemplateSubmission.tsx";
import TemplateSubmissions from "~/components/TemplateSubmissions.tsx";
import FormAggregation from "~/components/FormAggregation.tsx";
import {useLanguage} from "~/contexts/LanguageContext.tsx";


interface TemplateManagerProps {
    template: Template;
    isSavingChanges: boolean;
    onSavedChanges: (template: TemplateConfiguration) => void;
}

const TemplateManager = (props: TemplateManagerProps) => {
    const { t } = useLanguage();

    return (
        <div class="space-y-8">
            <Tabs defaultValue="form" disabled={props.isSavingChanges} class="w-full">
                <TabsList class="flex w-full border-b border-border mb-4 overflow-x-auto overflow-y-hidden">
                    <TabsTrigger value="form" class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        {t('Template')}
                    </TabsTrigger>
                    <TabsTrigger value="answers" class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        {t('AllForms')}
                    </TabsTrigger>
                    <TabsTrigger value="configuration" class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        {t('GeneralSettings')}
                    </TabsTrigger>
                    <TabsTrigger value="aggregation" class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        {t('FormAggregation')}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="form">
                    <TemplateSubmission template={props.template} />
                </TabsContent>
                <TabsContent value="answers">
                    <TemplateSubmissions template={props.template} />
                </TabsContent>
                <TabsContent value="configuration">
                    <TemplateSettings template={props.template} isSavingChanges={props.isSavingChanges} onSaveChanges={props.onSavedChanges} />
                </TabsContent>
                <TabsContent value="aggregation">
                    <FormAggregation template={props.template} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TemplateManager;