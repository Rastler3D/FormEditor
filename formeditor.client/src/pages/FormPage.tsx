import {useAuth} from "~/contexts/AuthContext";
import {useParams} from "@solidjs/router";
import {createResource, createEffect, Show} from "solid-js";
import {fetchForm, submitForm} from "~/services/formService";
import {ProgressCircle} from "~/components/ui/progress-circle";
import FormDetails from "~/components/FormDetails"
import {createAction} from "~/lib/action.ts";


const FormPage = () => {
    const {user} = useAuth();
    const params = useParams();
    const [formDetails, {mutate}] = createResource(() => Number(params.id), fetchForm);
    const formSubmission = createAction(submitForm, () => params.id);
    const isReadonly = () => !!user() || formDetails()?.form?.userId !== user()!.id && user().role !== 'admin';
    
    createEffect(() => {
        if (formSubmission.data()) {
            mutate(form => form.form = {...formSubmission.data(), answers: formSubmission.args().answers});
        }
    })

    return (
        <Show when={!formDetails.error} fallback={
            <div class="text-center">Form not found.</div>
        }>
            <Show when={!formDetails.loading} fallback={
                <div class="m-auto"> Loading <ProgressCircle showAnimation={true}></ProgressCircle></div>
            }>
                <FormDetails
                    form={formDetails()?.form!}
                    template={formDetails()?.template!}
                    isReadonly={isReadonly}
                    isSubmitting={formSubmission.data.loading}
                    onFormChange={value => formSubmission(value)}
                />
            </Show>
        </Show>
    )


}

export default FormPage;