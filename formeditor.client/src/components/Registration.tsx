import {Button} from "~/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import {TextField, TextFieldInput, TextFieldLabel} from "./ui/text-field";
import {FaBrandsGoogle, FaBrandsGithub} from 'solid-icons/fa';
import {A, useNavigate} from '@solidjs/router';
import {useAuth} from "../contexts/AuthContext";
import {createAction, resolve} from "../lib/action";
import {AlertCircle} from "lucide-solid";
import {createEffect, createSignal, For,  Show} from "solid-js";
import {Oval} from "solid-spinner";
import {useLanguage} from "~/contexts/LanguageContext.tsx";
import { showToast } from "./ui/toast";

const Registration = () => {
    const {signUp, signInWithProvider} = useAuth();
    const navigate = useNavigate();
    const registration = createAction(signUp);
    const [userName, setUserName] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const externalLogin = createAction(signInWithProvider);
    const {t} = useLanguage();

    createEffect(resolve(registration.data, () => navigate(`/registration/confirm-email/${email()}`)));
    createEffect(resolve(externalLogin.data, () => {
        showToast({title: t("SuccessfulExternalLogin"), variant: "success"});
        navigate("/home")
    }));

    createEffect(() => {
        if (externalLogin.data.error) {
            showToast({title: t("ExternalLoginFailed"), description: externalLogin.data.error, variant: "error"});
        }
    })

    const handleExternalLogin = (provider: "google" | "github") => {
        externalLogin(provider)
    }

    const handleRegistration = (e: SubmitEvent) => {
        e.preventDefault();
        registration({name: userName(), email: email(), password: password()})
    }

    return (
        <Card class="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle class="text-2xl font-bold">{t('SignUpPage')}</CardTitle>
                <CardDescription>
                    {t('CreateAnAccount')} 
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleRegistration} class="space-y-4">
                    <TextField required value={userName()} onChange={(value) => setUserName(value)}>
                        <TextFieldLabel>{t('UserName')}</TextFieldLabel>
                        <TextFieldInput type="text" placeholder="John Doe"/>
                    </TextField>
                    <TextField required value={email()} onChange={(value) => setEmail(value)}>
                        <TextFieldLabel>{t('Email')}</TextFieldLabel>
                        <TextFieldInput type="email" placeholder="m@example.com"/>
                    </TextField>
                    <TextField required value={password()} onChange={(value) => setPassword(value)}>
                        <TextFieldLabel>{t('Password')}</TextFieldLabel>
                        <TextFieldInput type="password"/>
                    </TextField>
                    <Show when={registration.data.error}>
                        <For each={Object.values(registration.data.error.errors) as string[][]}>
                            {(error) => (
                                <div class="text-red-500 flex items-center">
                                    <AlertCircle class="w-4 h-4 mr-2"/> {error[0]}
                                </div>
                            )}
                        </For>
                    </Show>
                    <Button
                        type="submit"
                        class="w-full"
                        disabled={registration.data.loading}
                    >
                        {registration.data.loading ? <Oval width="24" height="24" /> : t('CreateAccount')}
                    </Button>
                </form>
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"/>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-background px-2 text-muted-foreground">{t('OrContinueWith')}</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <Button variant="outline" type="button" class="w-full"
                            onClick={() => handleExternalLogin("github")}>
                        <FaBrandsGithub class="mr-2 h-4 w-4"/>
                        Github
                    </Button>
                    <Button variant="outline" type="button" class="w-full"
                            onClick={() => handleExternalLogin("google")}>
                        <FaBrandsGoogle class="mr-2 h-4 w-4"/>
                        Google
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <div class="text-center text-sm w-full">
                    {t('AlreadyHaveAccount')}{" "}
                    <A href="/login" class="text-primary underline">
                        {t('SignInTo')}
                    </A>
                </div>
            </CardFooter>
        </Card>
    )
}

export default Registration;