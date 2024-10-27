import {useAuth} from "~/contexts/AuthContext";
import {useParams} from "@solidjs/router";
import {createResource, createEffect, Show,  createSignal} from "solid-js";
import { getFormWithTemplate,  updateForm} from "~/services/formService";
import FormDetails from "~/components/FormDetails"
import {createAction} from "~/lib/action.ts";
import {Oval} from "solid-spinner";
import {Alert, AlertDescription, AlertTitle} from "~/components/ui/alert.tsx";
import {AlertCircle, FileText} from "lucide-solid";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import {showToast} from "~/components/ui/toast.tsx";


const FormPage = () => {
    const {user} = useAuth();
    const params = useParams();
    const [error, setError] = createSignal<string | null>(null);

    const [formDetails, {mutate}] = createResource(() => Number(params.id), getFormWithTemplate);
    const formSubmission = createAction(updateForm, () => params.id);

    const isReadonly = () => !user() || (formDetails()?.form?.submitterId !== user()!.id && user()!.role !== 'Admin');

    createEffect(() => {
        if (formSubmission.data()) {
            showToast({title: `Form successfully submitted`, variant: 'success'});
            mutate(prev => ({
                ...prev!,
                form: {...formSubmission.data()!, answers: formSubmission.args()!.filledForm.answers}
            }));
        }
        if (formSubmission.data.error) {
            setError("An error occurred while updating the form. Please try again.");
        }
    });

    const handleFormChange = (value) => {
        setError(null);
        formSubmission({formId: Number(params.id), filledForm: value});
    };

    return (
        <div class="container mx-auto p-4">
            <Show when={!formDetails.error} fallback={
                <Card class="mt-8">
                    <CardHeader>
                        <CardTitle class="text-2xl font-bold flex items-center gap-2">
                            <FileText size={24}/>
                            Form Not Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircle class="h-4 w-4"/>
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>Form not found. Please check the URL and try again.</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

            }>
                <Show when={!formDetails.loading} fallback={
                    <div class="flex justify-center items-baseline w-full h-full mt-28">
                        <Oval width="64" height="64"/>
                    </div>
                }>
                    <FormDetails
                        error={error()}
                        form={formDetails()?.form!}
                        template={formDetails()?.template!}
                        isReadonly={isReadonly()}
                        isSubmitting={formSubmission.data.loading}
                        onFormChange={handleFormChange}
                    />
                </Show>
            </Show>
        </div>
    );
};

export default FormPage;