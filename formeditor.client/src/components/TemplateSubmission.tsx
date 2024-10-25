import {AccessSetting, Answer, Form, Template} from "~/types/template.ts";
import {getSubmittedForm, submitOrUpdateForm} from "../services/formService";
import {Card, CardContent, CardFooter, CardHeader} from "./ui/card";
import TemplateView from "~/components/TemplateView.tsx";
import {createStore, reconcile, unwrap} from "solid-js/store";
import {createEffect, createSignal, Match, Show, createMemo, Switch, on} from "solid-js";
import {Button} from "~/components/ui/button.tsx";
import {createAction, createResource, resolve} from "~/lib/action.ts";
import {useAuth, User} from "~/contexts/AuthContext.tsx";
import {A} from "@solidjs/router";
import {Checkbox} from "~/components/ui/checkbox.tsx";
import {Label} from "~/components/ui/label.tsx";
import {Oval} from "solid-spinner";

interface TemplateSubmissionProps {
    template: Template;
}

const fetchSubmission = ({ templateId, user }: { templateId: number, user: User | undefined }) => {
    return new Promise<Form>((res, rej) => {
        if (user == null) {
            return res(undefined);
        } else {
            return getSubmittedForm(templateId, user.id)
                .then(res)
                .catch(rej);
        }
    });
}

export default function TemplateSubmission(props: TemplateSubmissionProps) {
    const [sendEmail, setSendEmail] = createSignal(false);
    const formSubmission = createAction(submitOrUpdateForm, () => props.template.id);
    const { user } = useAuth();
    const [form, { mutate: mutateForm }] = createResource(() => ({
        templateId: props.template.id,
        user: user()
    }), fetchSubmission);
    const [answers, setAnswers] = createStore({} as Record<number, Answer>);
    const [isEdit, setIsEdit] = createSignal(false);
    const filledBy = createMemo(() => user()?.name ?? "Anonymous");
    const fillingDate = createMemo(() => (isEdit() || !form()) ? new Date() : new Date(form()!.fillingDate));
    const hasPermission = () => !!user() &&
        (props.template.accessSetting == AccessSetting.All || props.template.allowList!.includes(user()!.id));

    createEffect(resolve(form, (data) => data && setAnswers(data.answers)));
    createEffect(resolve(formSubmission.data, (data) => data && mutateForm({ ...data, answers: unwrap(answers) })));
    createEffect(on(() => formSubmission.data.error, (error) => error && setIsEdit(true)));

    const handleEditForm = () => setIsEdit(true);
    const handleCancelEditForm = () => {
        const formData = form();
        if (formData) {
            setAnswers(reconcile(formData.answers));
        }
        setIsEdit(false);
    }

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        formSubmission({
            formId: form()?.id,
            filledForm: {
                templateId: props.template.id,
                fillingDate: fillingDate().toISOString(),
                answers: unwrap(answers),
                sendEmail: sendEmail()
            }
        })
        setIsEdit(false);
    }

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} class="space-y-6">
                <CardHeader>
                    <h2 class="text-2xl font-bold">Form Submission</h2>
                </CardHeader>
                <CardContent>
                    <TemplateView
                        template={props.template}
                        answers={answers}
                        setAnswers={setAnswers}
                        isReadonly={!hasPermission() || !isEdit()}
                        fillingDate={fillingDate()}
                        filledBy={form()?.submittedBy ?? filledBy()}
                    />
                </CardContent>
                <CardFooter class="flex flex-col space-y-4">
                    <Show when={!form.loading && !formSubmission.data.loading} fallback={
                        <Button disabled class="w-full">
                            <Oval width="24" height="24" class="mr-2" />
                            Loading...
                        </Button>
                    }>
                        <Show when={form()} fallback={
                            <Switch>
                                <Match when={!user()}>
                                    <p class="text-lg font-semibold text-muted-foreground">
                                        <A href="/login" class="underline">
                                            Sign in
                                        </A> to submit this form
                                    </p>
                                </Match>
                                <Match when={!hasPermission()}>
                                    <p class="text-lg font-semibold text-muted-foreground">
                                        You don't have permission to fill this form
                                    </p>
                                </Match>
                                <Match when={hasPermission()}>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox id="send-email" onChange={(value) => setSendEmail(value)} checked={sendEmail()} />
                                        <Label for="send-email">Send form on email?</Label>
                                    </div>
                                    <Button type="submit" class="w-full" disabled={!hasPermission()}>
                                        Submit
                                    </Button>
                                </Match>
                            </Switch>
                        }>
                            <p class="text-sm text-muted-foreground">
                                Form submitted: {new Date(form()!.submittedAt).toLocaleString()}
                            </p>
                            <Show when={isEdit()} fallback={
                                <Button class="w-full" onClick={handleEditForm}>Edit</Button>
                            }>
                                <div class="flex items-center space-x-2">
                                    <Checkbox id="send-email-edit" onChange={(value) => setSendEmail(value)} checked={sendEmail()} />
                                    <Label for="send-email-edit">Send form on email?</Label>
                                </div>
                                <div class="flex space-x-2 w-full">
                                    <Button type="submit" class="flex-1">Save</Button>
                                    <Button type="button" variant="outline" class="flex-1" onClick={handleCancelEditForm}>Cancel</Button>
                                </div>
                            </Show>
                        </Show>
                    </Show>
                </CardFooter>
            </form>
        </Card>
    )
}