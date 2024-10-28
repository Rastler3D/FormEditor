import {FaSolidEnvelope} from "solid-icons/fa";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {A, useParams} from "@solidjs/router";
import {createEffect, createMemo, on, Show} from "solid-js";
import {createAction} from "../lib/action";
import {resendConfirmationEmail} from "../services/userService";
import {showToast} from "../components/ui/toast";
import { Oval } from "solid-spinner";
import {useLanguage} from "~/contexts/LanguageContext.tsx";

const ConfirmEmailPage = ()=> {
    const params = useParams();
    const email = createMemo(() => params.email);
    const resend = createAction(resendConfirmationEmail, email);
    const {t} = useLanguage();
    
    createEffect(on(resend.data, () => {
        showToast({ title: 'Confirmation email resended', variant: 'success' });
    }))
    
    return (
        <div class="min-h-screen bg-background flex justify-center items-baseline p-4">
            <Card class="w-full max-w-md">
                <CardHeader>
                    <CardTitle class="text-2xl font-bold text-center">{t("ConfirmYourEmail")}</CardTitle>
                    <CardDescription class="text-center">
                        {t("CheckEmail")}
                    </CardDescription>
                </CardHeader>
                <CardContent class="text-center space-y-4">
                    <FaSolidEnvelope class="h-10 w-10 mx-auto text-primary"/>
                    <p>
                        {t("VerificationSent")}
                    </p>
                    <p class="text-sm text-muted-foreground">
                        {t("CheckSpam")}
                    </p>
                </CardContent>
                <CardFooter class="flex justify-center space-x-4">
                    <Show when={!resend.data.loading} fallback={
                        <Button variant="outline">
                            <Oval width="24" height="24" />
                        </Button>
                    }>
                        <Button onClick={() => resend(email()!)} variant="outline">
                            {t("ResendConfirmation")}
                        </Button>
                    </Show>
                    <Button as={A} href="/login">
                        {t("BackToLogin")}
                        
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default ConfirmEmailPage;