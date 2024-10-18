import {AccessSetting, Answer, Template} from "~/types/template.ts";
import {fetchTemplateSubmission, submitForm} from "../services/formService";
import {Card} from "./ui/card";
import TemplateView from "~/components/TemplateView.tsx";
import {createStore, reconcile, unwrap} from "solid-js/store";
import {createEffect, createResource, createSignal, Match, Show, createMemo, on} from "solid-js";
import {Button} from "~/components/ui/button.tsx";
import {ProgressCircle} from "~/components/ui/progress-circle.tsx";
import {createAction} from "~/lib/action.ts";
import {useAuth, User} from "~/contexts/AuthContext.tsx";
import {Switch} from "~/components/ui/switch.tsx";
import {A} from "@solidjs/router";

interface TemplateSubmissionProps {
    template: Template;
}
const fetchSubmission = async ({templateId, user} : {templateId: number, user: User | null}) => {
    if (user == null) {
        return null;
    } else {
        return await fetchTemplateSubmission(templateId)
    }
}
export default function TemplateSubmission(props: TemplateSubmissionProps) {
    const formSubmission = createAction(submitForm, () => props.template.id);
    const {user} = useAuth();
    const [form, {mutate: mutateForm}] = createResource(() => ({templateId: props.template.id, user: user()}), fetchSubmission);
    const [answers, setAnswers] = createStore({} as Record<number, Answer>);
    const [isEdit, setIsEdit] = createSignal(false);
    const filledBy = createMemo(() => user()?.name ?? "Anonymous");
    const fillingDate= createMemo(on(isEdit, () => new Date()));
    
    const hasPermission = () => !!user() && (props.template.accessSetting == AccessSetting.All || props.template.allowList!.includes(user()!.id));

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
        if (!formSubmission.data.loading) {
            const submittedForm = formSubmission.data();
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
        formSubmission({
            submitterId: user()!.id,
            templateId: props.template.id,
            fillingDate: fillingDate().toLocaleString(),
            answers: unwrap(answers),
        })
    }

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} class="space-y-6 p-6">
                <div class="p-4">
                    <h2 class="text-2xl font-bold mb-4">Form</h2>
                    <TemplateView template={props.template} 
                                  answers={answers} 
                                  setAnswers={setAnswers}
                                  isReadonly={!hasPermission() || !isEdit()} 
                                  fillingDate={form()?.fillingDate ?? fillingDate()} 
                                  filledBy={form()?.submittedBy ?? filledBy()}  />
                    <Show when={!form.loading && !formSubmission.data.loading} fallback={
                        <Button disabled class="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Loading <ProgressCircle showAnimation={true}></ProgressCircle>
                        </Button>
                    }>
                        <Show when={form()} fallback={
                            <Switch>
                                <Match when={!user()}>
                                    <h3 class="text-lg font-semibold mb-2 text-muted-foreground">
                                        <A href="/login" class="underline">
                                            Sign in
                                        </A> to submit this form</h3>
                                </Match>
                                <Match when={!hasPermission()}>
                                    <h3 class="text-lg font-semibold mb-2 text-muted-foreground">
                                        You don't have permission to fill this form
                                    </h3>
                                    <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            disabled>Submit</Button>
                                </Match>
                                <Match when={hasPermission()}>
                                    <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            onClick={handleSubmit} disabled={!hasPermission()}>Submit</Button>
                                </Match>
                            </Switch>
                            
                        }>
                            <p class="text-sm text-muted-foreground">
                                Form submitted: {form()!.submittedAt}
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