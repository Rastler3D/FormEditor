import {useParams} from "@solidjs/router";
import {createEffect, createResource, on, Show} from "solid-js";
import {fetchTemplate, updateTemplate} from "~/services/templateService.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";

import TemplateSubmission from "~/components/TemplateSubmission.tsx";
import TemplateManager from "~/components/TemplateManager.tsx";
import {createAction} from "~/lib/action.ts";
import {Oval} from "solid-spinner";
import Comments from "~/components/Comments.tsx";
import Likes from "~/components/Likes.tsx";
import {showToast} from "~/components/ui/toast.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import {Alert, AlertDescription, AlertTitle} from "~/components/ui/alert.tsx";
import {AlertCircle, Folder} from "lucide-solid";

const TemplatePage = () => {
    const {user} = useAuth();
    const params = useParams();
    const [template, {mutate}] = createResource(() => Number(params.templateId), fetchTemplate);
    const templateUpdating = createAction(updateTemplate, () => params.templateId);

    createEffect(on(templateUpdating.data, (updatedTemplate) => {
        if (updatedTemplate) {
            showToast({title: `Template successfully updated`, variant: 'success'});
            mutate(updatedTemplate);
        }
    }));

    return (
        <div class="container mx-auto p-4">
            <Show when={!template.error} fallback={
                <Card class="mt-8">
                    <CardHeader>
                        <CardTitle class="text-2xl font-bold flex items-center gap-2">
                            <Folder size={24}/>
                            Template not found.
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircle class="h-4 w-4"/>
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>Template not found. Please check the URL and try again.</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            }>
                <Show when={!template.loading} fallback={
                    <div class="flex justify-center items-baseline w-full h-full mt-28">
                        <Oval width="64" height="64"/>
                    </div>
                }>
                    <div class="flex flex-col space-y-8">
                        <Show when={user()?.id == template()?.creatorId || user()?.role == 'Admin'}
                              fallback={
                                  <TemplateSubmission template={template()!}/>
                              }>
                            <TemplateManager
                                template={template()!}
                                onSavedChanges={(updatedTemplate) => templateUpdating({
                                    templateId: Number(params.templateId),
                                    template: updatedTemplate
                                })}
                                isSavingChanges={templateUpdating.data.loading}
                            />
                        </Show>
                        <Likes template={template()!}/>
                        <Comments template={template()!}/>
                    </div>
                </Show>
            </Show>
        </div>
    )
}

export default TemplatePage;