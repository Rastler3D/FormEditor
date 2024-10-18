import {useNavigate, useParams} from "@solidjs/router";
import {createEffect, createResource, on, Show} from "solid-js";
import {createTemplate, fetchTemplate, updateTemplate} from "~/services/api.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";
import {ProgressCircle} from "~/components/ui/progress-circle";
import TemplateSubmission from "~/components/TemplateSubmission.tsx";
import TemplateManager from "~/components/TemplateManager.tsx";
import {createAction} from "~/lib/action.ts";
import TemplateCreation from "../components/TemplateCreation";

const TemplatePage = () => {
    const navigate = useNavigate();
    const templateCreating = createAction(createTemplate);

    createEffect(on(templateCreating.data,
        (template) => template && navigate(`/templates/${template.id}`)));

    return (
        <TemplateCreation onSavedChanges={templateCreating} isSavingChanges={templateCreating.data.loading}/>
    )
}

export default TemplatePage;