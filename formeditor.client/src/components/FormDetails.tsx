import {createSignal, createEffect, Show} from 'solid-js';
import {useParams} from '@solidjs/router';
import {Card, CardHeader, CardTitle, CardContent} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {useAuth} from '~/contexts/AuthContext';
import {fetchForm} from '~/services/formService';
import FormSubmission from '~/components/FormSubmission';
import CommentaryComponent from '~/components/CommentaryComponent';
import {Template, Form} from '~/types/template';
import {Avatar, AvatarFallback, AvatarImage} from '~/components/ui/avatar';
import {Separator} from '~/components/ui/separator';

import {Answer, FilledForm, Form, FormInfo, QuestionTypes, Template} from "~/types/template.ts";
import {Card} from "~/components/ui/card.tsx";
import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {fetchForm, fetchTemplateSubmission, submitForm} from "../services/formService";
import {createStore, reconcile, unwrap} from "solid-js/store";
import TemplateView from "./TemplateView";
import {Button} from "./ui/button";
import {ProgressCircle} from "./ui/progress-circle";

interface FormDetailsProps {
    template: Template;
    form: Form;
    isReadonly: boolean;
    isSubmitting: boolean;
    onFormChange: (value: Form) => void;
}

export default function FormDetails(props: FormDetailsProps) {
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
        <div class="container mx-auto p-4">
            <Card class="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle class="text-2xl font-bold">Form Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Template: {props.template.name}</h3>
                        <h3 className="text-lg font-semibold mb-2">Submitted by: {props.form.userName}</h3>
                        <p class="text-sm text-muted-foreground mt-2">
                            Submitted on: {new Date(props.form.submittedAt).toLocaleString()}
                        </p>
                    </div>
                    <Separator class="my-6"/>
                    <div class="p-4">
                        <h2 class="text-2xl font-bold mb-4">Form</h2>
                        <TemplateView template={props.template} answers={answers} setAnswers={setAnswers}
                                      isReadonly={props.isReadonly || !isEdit() || props.isSubmitting}/>
                        <Show when={!props.isSubmitting} fallback={
                            <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                Loading <ProgressCircle showAnimation={true}></ProgressCircle>
                            </Button>
                        }>
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}