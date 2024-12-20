﻿import {AccessSetting, Answer, Form, Template} from "~/types/types.ts";
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
import {Alert, AlertDescription, AlertTitle} from "~/components/ui/alert.tsx";
import {showToast} from "~/components/ui/toast.tsx";
import { AlertCircle } from "lucide-solid";
import {useLanguage} from "~/contexts/LanguageContext.tsx";

interface TemplateSubmissionProps {
    template: Template;
}

const fetchSubmission = ({templateId, user}: { templateId: number, user: User | undefined }) => {
    return new Promise<Form | undefined>((res, rej) => {
        if (user == null) {
            return res(undefined);
        } else {
            return getSubmittedForm(templateId, user.id)
                .then(res)
                .catch(err => {
                    if (err.status === 404) {
                        res(undefined);
                    } else {
                        rej(err)
                    }
                });
        }
    });
}

export default function TemplateSubmission(props: TemplateSubmissionProps) {
    const { t } = useLanguage();
    const [sendEmail, setSendEmail] = createSignal(false);
    const formSubmission = createAction(submitOrUpdateForm, () => props.template.id);
    const {user} = useAuth();
    const [form, {mutate: mutateForm}] = createResource(() => ({
        templateId: props.template.id,
        user: user()
    }), fetchSubmission);
    const [answers, setAnswers] = createStore({} as Record<number, Answer>);
    const [isEdit, setIsEdit] = createSignal(false);
    const filledBy = createMemo(() => user()?.name ?? "Anonymous");
    const fillingDate = createMemo(() => (isEdit() || !form()) ? new Date() : new Date(form()!.fillingDate));
    const hasPermission = () => !!user() &&
        (props.template.accessSetting == AccessSetting.All || props.template.allowList!.includes(user()!.id));

    createEffect(resolve(form, (data) => {
        if (data) {
            setAnswers(reconcile(data.answers))
        } else {
            setIsEdit(true)
        }
    }));
    createEffect(resolve(formSubmission.data, (data) => {
        if (data) {
            showToast({title: `Form successfully submitted`, variant: 'success'});
            setIsEdit(false);
            mutateForm({
                ...data,
                answers: unwrap(answers)
            })
        }
    }));
    createEffect(on(() => formSubmission.data.error, (error) => error && setIsEdit(true)));
    

    const handleEditForm = () => setIsEdit(true);
    const handleCancelEditForm = () => {
        const formData = form();
        if (formData) {
            setAnswers(reconcile(formData.answers));
        }
        setIsEdit(false);
    }

    const handleSubmit = (e: SubmitEvent) => {
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
                    <h2 class="text-2xl font-bold">{t('FormSubmission')}</h2>
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
                    <Show when={formSubmission.data.error}>
                        <Alert variant="destructive" class="mt-4">
                            <AlertCircle class="h-4 w-4" />
                            <AlertTitle>{t('Error')}</AlertTitle>
                            <AlertDescription>{formSubmission.data.error}</AlertDescription>
                        </Alert>
                    </Show>
                </CardContent>
                <CardFooter class="flex flex-col space-y-4">
                    <Show
                        when={!form.loading && !formSubmission.data.loading}
                        fallback={
                            <Button disabled class="w-full">
                                <Oval width="24" height="24" class="mr-2" />
                            </Button>
                        }
                    >
                        <Show
                            when={form()}
                            fallback={
                                <Switch>
                                    <Match when={!user()}>
                                        <p class="text-lg font-semibold text-muted-foreground">
                                            <A href="/login" class="underline">
                                                {t('SignIn')}
                                            </A>{' '}
                                            {t('ToSubmitForm')}
                                        </p>
                                    </Match>
                                    <Match when={!hasPermission()}>
                                        <p class="text-lg font-semibold text-muted-foreground">{t('NoPermissionToFillForm')}</p>
                                    </Match>
                                    <Match when={hasPermission()}>
                                        <div class="flex items-center space-x-2">
                                            <Checkbox id="send-email" onChange={(value) => setSendEmail(value)} checked={sendEmail()} />
                                            <Label for="send-email">{t('SendFormViaEmail')}</Label>
                                        </div>
                                        <Button type="submit" class="w-full" disabled={!hasPermission()}>
                                            {t('Submit')}
                                        </Button>
                                    </Match>
                                </Switch>
                            }
                        >
                            <p class="text-sm text-muted-foreground">
                                {t('FormSubmitted')}: {new Date(form()!.submittedAt).toLocaleString()}
                            </p>
                            <Show
                                when={isEdit()}
                                fallback={
                                    <Button class="w-full" onClick={handleEditForm}>
                                        {t('Edit')}
                                    </Button>
                                }
                            >
                                <div class="flex items-center space-x-2">
                                    <Checkbox id="send-email-edit" onChange={(value) => setSendEmail(value)} checked={sendEmail()} />
                                    <Label for="send-email-edit">{t('SendFormViaEmail')}</Label>
                                </div>
                                <div class="flex space-x-2 w-full">
                                    <Button type="submit" class="flex-1">
                                        {t('Save')}
                                    </Button>
                                    <Button type="button" variant="outline" class="flex-1" onClick={handleCancelEditForm}>
                                        {t('Cancel')}
                                    </Button>
                                </div>
                            </Show>
                        </Show>
                    </Show>
                </CardFooter>
            </form>
        </Card>
    );
}