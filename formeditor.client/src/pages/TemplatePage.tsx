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

const TemplatePage = () => {
    const {user} = useAuth();
    const params = useParams();
    const [template, {mutate}] = createResource(() => Number(params.id), fetchTemplate);
    const templateUpdating = createAction(updateTemplate, () => params.id);

    createEffect(on(templateUpdating.data, (updatedTemplate) => {
        if (updatedTemplate) {
            mutate(updatedTemplate);
        }
    }));

    return (
        <div class="container mx-auto p-4">
            <Show when={!template.error} fallback={
                <div class="text-center text-xl text-destructive">Template not found.</div>
            }>
                <Show when={template()} fallback={
                    <div class="flex justify-center items-center h-64">
                        <Oval width="48" height="48"/>
                        <span class="ml-2 text-lg">Loading...</span>
                    </div>
                }>
                    <div class="flex flex-col space-y-8">
                        <Show when={user()?.id == template()?.creatorId || user()?.role == 'Admin'} fallback={
                            <TemplateSubmission template={template()!}/>
                        }>
                            <TemplateManager
                                template={template()!}
                                onSavedChanges={(updatedTemplate) => templateUpdating({
                                    templateId: Number(params.id),
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
;