import {Card, CardHeader, CardTitle, CardContent} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Separator} from '~/components/ui/separator';
import {FilledForm, Form, Template} from "~/types/template.ts";
import {createEffect, createMemo, createSignal, Show} from "solid-js";
import {createStore, reconcile, unwrap} from "solid-js/store";
import TemplateView from "./TemplateView";
import {Checkbox} from "~/components/ui/checkbox.tsx";
import {Label} from "~/components/ui/label.tsx";
import {Alert, AlertDescription, AlertTitle} from "~/components/ui/alert.tsx";
import { AlertCircle } from 'lucide-solid';
import { Oval } from 'solid-spinner';
import { createWritableMemo } from '@solid-primitives/memo';

interface FormDetailsProps {
    error?: string;
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
    const [error, setError] = createWritableMemo(()=> props.error);
    const fillingDate = createMemo(() => isEdit() ? new Date() : new Date(props.form.fillingDate));
    
    createEffect((prevId) => {
        if (props.form.id !== prevId) {
            setIsEdit(false);
            setError(null);
        }
        setAnswers(props.form.answers);

        return prevId;
    }, props.form.id);

    const handleEditForm = () => {
        setIsEdit(true);
        setError(null);
    }

    const handleCancelEditForm = () => {
        setAnswers(reconcile(props.form.answers));
        setIsEdit(false);
        setError(null);
    }

    const handleSubmit = () => {
        setIsEdit(false);
        setError(null);

        props.onFormChange({
            fillingDate: fillingDate().toISOString(),
            templateId: props.form.templateId,
            answers: unwrap(answers),
            sendEmail: sendEmail()
        });
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
                        <p class="text-lg font-semibold mb-2 text-muted-foreground mt-2">
                            Submitted on: {new Date(props.form.submittedAt).toLocaleString()}
                        </p>
                    </div>
                    <Separator class="my-6"/>
                    <div class="p-4">
                        <TemplateView
                            template={props.template}
                            answers={answers}
                            setAnswers={setAnswers}
                            isReadonly={props.isReadonly || !isEdit() || props.isSubmitting}
                            fillingDate={fillingDate()}
                            filledBy={props.form.submittedBy}
                        />
                        <Show when={error()}>
                            <Alert variant="destructive" class="mt-4">
                                <AlertCircle class="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error()}</AlertDescription>
                            </Alert>
                        </Show>
                        <Show when={!props.isSubmitting} fallback={
                            <Button disabled class="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                                <Oval width="24" height="24" class="mr-2" />
                            </Button>
                        }>
                            <Show when={!props.isReadonly}>
                                <Show when={isEdit()} fallback={
                                    <Button
                                        class="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={handleEditForm}
                                    >
                                        Edit
                                    </Button>
                                }>
                                    <div class="mt-4 space-y-4">
                                        <div class="flex items-center space-x-2">
                                            <Checkbox id="send-email" checked={sendEmail()} onChange={setSendEmail} />
                                            <Label for="send-email">Send form via email?</Label>
                                        </div>
                                        <Button
                                            class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            onClick={handleSubmit}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            class="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                            onClick={handleCancelEditForm}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Show>
                            </Show>
                        </Show>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}