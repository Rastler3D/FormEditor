import {Tabs, TabsList, TabsTrigger, TabsContent} from "~/components/ui/tabs";
import TemplateSettings from "~/components/TemplateSettings";
import {Template, TemplateConfiguration} from "~/types/template.ts";
import TemplateSubmission from "~/components/TemplateSubmission.tsx";
import TemplateSubmissions from "~/components/TemplateSubmissions.tsx";
import FormAggregation from "~/components/FormAggregation.tsx";
import Likes from "~/components/Likes.tsx";
import Comments from "~/components/Comments.tsx";

interface TemplateManagerProps {
    template: Template;
    isSavingChanges: boolean;
    onSavedChanges: (template: TemplateConfiguration) => void;
}

const TemplateManager = (props: TemplateManagerProps) => {
    return (
        <div class="container mx-auto p-4">
            <Tabs defaultValue="form" disabled={props.isSavingChanges}>
                <TabsList class="flex space-x-2 mb-4">
                    <TabsTrigger value="form"
                                 class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        Form
                    </TabsTrigger>
                    <TabsTrigger value="answers"
                                 class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        Answers
                    </TabsTrigger>
                    <TabsTrigger value="configuration"
                                 class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        Configuration
                    </TabsTrigger>
                    <TabsTrigger value="aggregation"
                                 class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        Aggregation
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

            <div class="p-6 border-t border-border">
                <Likes template={props.template}></Likes>
                <Comments template={props.template}></Comments>
            </div>
        </div>
    );
};

export default TemplateManager;