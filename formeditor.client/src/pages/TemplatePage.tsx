import {useParams} from "@solidjs/router";
import {createEffect, createResource, on, Show} from "solid-js";
import {fetchTemplate, updateTemplate} from "~/services/templateService.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";

import TemplateSubmission from "~/components/TemplateSubmission.tsx";
import TemplateManager from "~/components/TemplateManager.tsx";
import {createAction} from "~/lib/action.ts";
import { Oval } from "solid-spinner";

const TemplatePage = () => {
    const { user } = useAuth();
    const params = useParams();
    const [template, { mutate }] = createResource(() => Number(params.id), fetchTemplate);
    const templateUpdating = createAction(updateTemplate, () => params.id);
    
    createEffect(on(templateUpdating.data,
        template => template && mutate(template)));

    return (
        <div class="container mx-auto p-4">
            <Show when={!template.error} fallback={
                <div class="text-center text-xl text-destructive">Template not found.</div>
            }>
                <Show when={template()} fallback={
                    <div class="flex justify-center items-center h-64">
                        <Oval width="48" height="48" />
                        <span class="ml-2 text-lg">Loading...</span>
                    </div>
                }>
                    <Show when={user()?.id == template()?.creatorId || user()?.role == 'Admin'} fallback={
                        <TemplateSubmission template={template()!} />
                    }>
                        <TemplateManager
                            template={template()!}
                            onSavedChanges={(template) => templateUpdating({ templateId: Number(params.id), template })}
                            isSavingChanges={templateUpdating.data.loading}
                        />
                    </Show>
                </Show>
            </Show>
        </div>
    )
}

export default TemplatePage;