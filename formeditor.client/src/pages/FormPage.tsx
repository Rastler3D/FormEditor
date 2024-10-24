import {useAuth} from "~/contexts/AuthContext";
import {useParams} from "@solidjs/router";
import {createResource, createEffect, Show, untrack} from "solid-js";
import {fetchForm, getFormWithTemplate, submitForm, updateForm} from "~/services/formService";
import {ProgressCircle} from "~/components/ui/progress-circle";
import FormDetails from "~/components/FormDetails"
import {createAction} from "~/lib/action.ts";
import { Oval } from "solid-spinner";


const FormPage = () => {
    const {user} = useAuth();
    const params = useParams();
    const [formDetails, {mutate}] = createResource(() => Number(params.id), getFormWithTemplate);
    const formSubmission = createAction(updateForm, () => params.id);
    const isReadonly = () => !user() || (formDetails()?.form?.submitterId !== user()!.id && user()!.role !== 'Admin');
    
    createEffect(() => {
        if (formSubmission.data() && untrack(formDetails)) {
            mutate({...formDetails()!, form: {...formSubmission.data()!, answers: formSubmission.args()!.filledForm.answers} });
        }
    })

    return (
        <Show when={!formDetails.error} fallback={
            <div class="m-auto"><h1>Form not found.</h1></div>
        }>
            <Show when={!formDetails.loading} fallback={
                <div class="m-auto"> Loading <Oval width="64" height="64" /></div>
            }>
                <FormDetails
                    form={formDetails()?.form!}
                    template={formDetails()?.template!}
                    isReadonly={isReadonly()}
                    isSubmitting={formSubmission.data.loading}
                    onFormChange={value => formSubmission({formId: Number(params.id), filledForm: value})}
                />
            </Show>
        </Show>
    )


}

export default FormPage;