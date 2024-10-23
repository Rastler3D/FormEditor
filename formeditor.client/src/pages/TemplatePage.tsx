import {useParams} from "@solidjs/router";
import {createEffect, createResource, on, Show} from "solid-js";
import {fetchTemplate, updateTemplate} from "~/services/templateService.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";
import {ProgressCircle} from "~/components/ui/progress-circle";
import TemplateSubmission from "~/components/TemplateSubmission.tsx";
import TemplateManager from "~/components/TemplateManager.tsx";
import {createAction} from "~/lib/action.ts";
import { Oval } from "solid-spinner";

const TemplatePage = () => {
    const {user} = useAuth();
    const params = useParams();
    const [template, {mutate}] = createResource(() => Number(params.id), fetchTemplate);
    const templateUpdating = createAction(updateTemplate, () => params.id);

    createEffect(on(templateUpdating.data,
        template => template && mutate(template)));
    
    return (
        <Show when={!template.error} fallback={
            <div class="m-auto">Template not found.</div>
        }>
            <Show when={template()} fallback={
                <div class="m-auto"> Loading <Oval width="24" height="24" /></div>
            }>
                <Show when={user()?.id == template()?.creatorId || user()?.role == 'Admin'} fallback={
                    <TemplateSubmission template={template()!}/>
                }>
                    <TemplateManager
                        template={template()!}
                        onSavedChanges={(template) => templateUpdating({templateId: Number(params.id), template})}
                        isSavingChanges={templateUpdating.data.loading}
                    />
                </Show>
            </Show>
        </Show>
    )
}

export default TemplatePage;