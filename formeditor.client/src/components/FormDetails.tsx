import {Card, CardHeader, CardTitle, CardContent} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Separator} from '~/components/ui/separator';
import {FilledForm, Form, Template} from "~/types/template.ts";
import {createEffect, createMemo, createSignal, Show} from "solid-js";
import {createStore, reconcile, unwrap} from "solid-js/store";
import TemplateView from "./TemplateView";
import {ProgressCircle} from "./ui/progress-circle";
import {Checkbox} from "~/components/ui/checkbox.tsx";
import {Label} from "~/components/ui/label.tsx";

interface FormDetailsProps {
    template: Template;
    form: Form;
    isReadonly: boolean;
    isSubmitting: boolean;
    onFormChange: (value: FilledForm) => void;
}

export default function FormDetails(props: FormDetailsProps) {
    const [answers, setAnswers] = createStore(props.form.answers);
    const [sendEmail, setSendEmail] = createSignal(false);
    const [isEdit, setIsEdit] = createSignal(false);
    const fillingDate = createMemo(() => isEdit() ? new Date() : new Date(props.form.fillingDate));
    
    createEffect((prevId) => {
        if (props.form.id !== prevId) {
            setIsEdit(false);
        }
        setAnswers(props.form.answers);

        return prevId;
    }, props.form.id)

    const handleEditForm = () => {
        setIsEdit(true);
    }
    const handleCancelEditForm = () => {
        setAnswers(reconcile(props.form.answers));
        setIsEdit(false);
    }

    const handleSubmit = () => {
        props.onFormChange({
            fillingDate: fillingDate().toLocaleString(),
            templateId: props.form.templateId,
            answers: unwrap(answers),
            sendEmail: sendEmail()
        })
    }
    return (
        <div class="container mx-auto p-4">
            <Card class="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle class="text-2xl font-bold">Form Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-2">Template: {props.template.name}</h3>
                        <h3 class="text-lg font-semibold mb-2">Submitted by: {props.form.submittedBy}</h3>
                        <p class="text-sm text-muted-foreground mt-2">
                            Submitted on: {new Date(props.form.submittedAt).toLocaleString()}
                        </p>
                    </div>
                    <Separator class="my-6"/>
                    <div class="p-4">
                        <h2 class="text-2xl font-bold mb-4">Form</h2>
                        <TemplateView template={props.template} answers={answers} setAnswers={setAnswers}
                                      isReadonly={props.isReadonly || !isEdit() || props.isSubmitting}
                                      fillingDate={fillingDate()} filledBy={props.form.submittedBy}/>
                        <Show when={!props.isSubmitting} fallback={
                            <Button disabled class="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                Loading <ProgressCircle showAnimation={true}></ProgressCircle>
                            </Button>
                        }>
                            <Show when={!props.isReadonly}>
                                <Show when={isEdit} fallback={
                                    <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            onClick={handleEditForm}>Edit</Button>
                                }>
                                    <div className="items-top flex space-x-2">
                                        <Checkbox id="terms1" onChange={setSendEmail} checked={sendEmail()}/>
                                        <div className="grid gap-1.5 leading-none">
                                            <Label for="terms1-input">Send form on email?</Label>
                                        </div>
                                    </div>
                                    <Button
                                        class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={handleSubmit}>Save</Button>
                                    <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            onClick={handleCancelEditForm}>Cancel</Button>
                                </Show>
                            </Show>
                        </Show>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}