import {Answer, Template} from "~/types/template.ts";
import {createResource} from "solid-js/types/server";
import {fetchSubmittedForm, submitForm} from "../services/formService";
import {Card} from "./ui/card";
import TemplateView from "~/components/TemplateView.tsx";
import {createStore, reconcile, unwrap} from "solid-js/store";
import {createEffect, createSignal, Match, Show, Switch} from "solid-js";
import {Button} from "~/components/ui/button.tsx";
import {ProgressCircle} from "~/components/ui/progress-circle.tsx";

interface FormSubmissionProps {
    template: Template;
}

export default function FormSubmission(props: FormSubmissionProps) {
    const [submit, setSubmit] = createSignal();
    const [formSubmission] = createResource(submit, submitForm);
    const [form, {mutate: mutateForm}] = createResource(props.template.id, fetchSubmittedForm);
    const [answers, setAnswers] = createStore({} as Record<number, Answer>);
    const [isEdit, setIsEdit] = createSignal(false);

    createEffect(() => {
        if (!form.loading) {
            const fetchedForm = form();
            if (fetchedForm) {
                setAnswers(fetchedForm.answers);
            } else {
                setIsEdit(true);
            }
        }
    })

    createEffect(() => {
        if (!formSubmission.loading) {
            const submittedForm = formSubmission();
            if (submittedForm) {
                mutateForm({...submittedForm, answers: unwrap(answers)});
            } else {
                setIsEdit(true);
            }
        }
    })

    const handleEditForm = () => {
        setIsEdit(true);
    }
    const handleCancelEditForm = () => {
        const formData = form();
        if (formData) {
            setAnswers(reconcile(formData.answers));
        }
        setIsEdit(false);
    }

    const handleSubmit = () => {
        setIsEdit(false);
        setSubmit({
            templateId: props.template.id,
            answers: unwrap(answers),
        })
    }

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} class="space-y-6 p-6">
                <div class="p-4">
                    <h2 class="text-2xl font-bold mb-4">Form</h2>
                    <TemplateView template={props.template} answers={answers} setAnswers={setAnswers}
                                  isReadonly={!isEdit()}/>
                    <Show when={!form.loading && !formSubmission.loading} fallback={
                        <Button type="submit" class="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Loading <ProgressCircle showAnimation={true}></ProgressCircle>
                        </Button>
                    }>
                        <Show when={form()} fallback={
                            <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={handleSubmit}>Submit</Button>
                        }>
                            <p class="text-sm text-muted-foreground">
                                Form submitted: {form().submittedAt}
                            </p>
                            <Show when={isEdit} fallback={
                                <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={handleEditForm}>Edit</Button>
                            }>
                                <Button type="submit"
                                        class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={handleSubmit}>Save</Button>
                                <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={handleCancelEditForm}>Cancel</Button>
                            </Show>
                        </Show>

                    </Show>
                </div>
            </form>
        </Card>
    )
}