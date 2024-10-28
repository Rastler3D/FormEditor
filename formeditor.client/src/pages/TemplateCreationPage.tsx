import {useNavigate} from "@solidjs/router";
import {createEffect,  on, } from "solid-js";
import {createTemplate, } from "~/services/templateService.ts";

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