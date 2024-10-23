import {FaSolidEnvelope} from "solid-icons/fa";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {A, useParams} from "@solidjs/router";
import {createEffect, createMemo, on, Show} from "solid-js";
import {createAction} from "../lib/action";
import {resendConfirmationEmail} from "../services/userService";
import {showToast} from "../components/ui/toast";
import { Oval } from "solid-spinner";

const ConfirmEmailPage = ()=> {
    const params = useParams();
    const email = createMemo(() => params.email);
    const resend = createAction(resendConfirmationEmail, email);
    
    createEffect(on(resend.data, () => {
        showToast({ title: 'Confirmation email resended', variant: 'success' });
    }))
    
    return (
        <div class="min-h-screen bg-background flex justify-center items-baseline p-4">
            <Card class="w-full max-w-md">
                <CardHeader>
                    <CardTitle class="text-2xl font-bold text-center">Confirm Your Email</CardTitle>
                    <CardDescription class="text-center">
                        Please check your email to confirm your account
                    </CardDescription>
                </CardHeader>
                <CardContent class="text-center space-y-4">
                    <FaSolidEnvelope class="h-10 w-10 mx-auto text-primary"/>
                    <p>
                        We've sent a confirmation email to your registered email address.
                        Please check your inbox and click on the confirmation link to activate your account.
                    </p>
                    <p class="text-sm text-muted-foreground">
                        If you don't see the email, please check your spam folder.
                    </p>
                </CardContent>
                <CardFooter class="flex justify-center space-x-4">
                    <Show when={!resend.data.loading} fallback={
                        <Button variant="outline">
                            <Oval width="24" height="24" />
                        </Button>
                    }>
                        <Button onClick={() => resend(email()!)} variant="outline">
                            Resend Confirmation
                        </Button>
                    </Show>
                    <Button as={A} href="/login">
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default ConfirmEmailPage;