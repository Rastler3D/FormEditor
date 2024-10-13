import {useParams} from "@solidjs/router";
import {createResource, Show} from "solid-js";
import {fetchTemplate} from "~/services/api.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";
import {ProgressCircle} from "~/components/ui/progress-circle";
import FormSubmission from "~/components/FormSubmission.tsx";
import TemplateManager from "~/components/TemplateManager.tsx";

const TemplatePage = () => {
    const {user} = useAuth();
    const params = useParams();
    const [template] = createResource(() => Number(params.id), fetchTemplate);
    
    return (
        <Show when={user() && template()} fallback={
            <div class="m-auto"> Loading <ProgressCircle showAnimation={true}></ProgressCircle></div>
        }>
            <Show when={user()?.id == template()?.creatorId || user()?.role == 'admin'} fallback={
                <FormSubmission template={template()!} />
            }>
                <TemplateManager template={template()!} />
            </Show>
        </Show>
    )
}

export default TemplatePage;