import {Answer, FilledForm, Form, FormInfo, QuestionTypes, Template} from "~/types/template.ts";
import {Card} from "~/components/ui/card.tsx";
import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {fetchForm, fetchTemplateSubmission, submitForm} from "../services/formService";
import {createStore, reconcile, unwrap} from "solid-js/store";
import TemplateView from "./TemplateView";
import {Button} from "./ui/button";
import {ProgressCircle} from "./ui/progress-circle";

interface FormViewProps {
    template: Template;
    form: Form;
    isReadonly: boolean;
    isSubmitting: boolean;
    onFormChange: (value: Form) => void;
}

export default function FormView(props: FormViewProps) {
    const [answers, setAnswers] = createStore(props.form.answers);
    const [isEdit, setIsEdit] = createSignal(false);

    createEffect((prevId) => {
        if (props.form.id !== prevId) {
            setIsEdit(false);
        }
        setAnswers(props.form.answers);
    }, props.form.id)
    
    const handleEditForm = () => {
        setIsEdit(true);
    }
    const handleCancelEditForm = () => {
        setAnswers(reconcile(props.form.answers));
        setIsEdit(false);
    }

    const handleSubmit = () => {
        props.onFormChange(unwrap(answers))
    }
   

    return (
        
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <div  class="space-y-6 p-6">
                <div class="p-4">
                    <h2 class="text-2xl font-bold mb-4">Form</h2>
                    <TemplateView template={props.template} answers={answers} setAnswers={setAnswers}
                                  isReadonly={props.isReadonly || !isEdit() || props.isSubmitting}/>
                    <Show when={!props.isSubmitting} fallback={
                        <Button  class="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Loading <ProgressCircle showAnimation={true}></ProgressCircle>
                        </Button>
                    }>
                                <p class="text-sm text-muted-foreground">
                                    Form submitted: {form().submittedAt}
                                </p>
                        <Show when={!props.isReadonly}>
                                <Show when={isEdit} fallback={
                                    <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            onClick={handleEditForm}>Edit</Button>
                                }>
                                    <Button 
                                            class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            onClick={handleSubmit}>Save</Button>
                                    <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            onClick={handleCancelEditForm}>Cancel</Button>
                                </Show>
                            </Show>
                        </Show>

                    </Show>
                </div>
            </form>
        </Card>
    )
}