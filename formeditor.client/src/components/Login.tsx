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
import {createEffect, createSignal, Show} from "solid-js";
import {Oval} from "solid-spinner";
import {showToast} from "~/components/ui/toast.tsx";
import {useLanguage} from "~/contexts/LanguageContext.tsx";

const Login = () => {
    const {signIn, signInWithProvider} = useAuth();
    const navigate = useNavigate();
    const login = createAction(signIn);
    const externalLogin = createAction(signInWithProvider);
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const {t} = useLanguage();
    createEffect(resolve(login.data, () => navigate("/home")));
    createEffect(resolve(externalLogin.data, () => {
        showToast({title: t("SuccessfulExternalLogin"), variant: "success"});
        navigate("/home")
    }));

    createEffect(() => {
        if (externalLogin.data.error) {
            showToast({title: t("ExternalLoginFailed"), description: externalLogin.data.error, variant: "error"});
        }
    })
    const handleLogin = (e: SubmitEvent) => {
        e.preventDefault();
        login({email: email(), password: password()})
    }

    const handleExternalLogin = (provider: "google" | "github") => {
        externalLogin(provider)
    }

    return (
        <Card class="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle class="text-2xl font-bold">{t("SignInPage")}</CardTitle>
                <CardDescription>
                    {t('EnterYourEmail')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} class="space-y-4">
                    <TextField required value={email()} onChange={(value) => setEmail(value)}>
                        <TextFieldLabel>{t('Email')}</TextFieldLabel>
                        <TextFieldInput type="email" placeholder="m@example.com"/>
                    </TextField>
                    <TextField required value={password()} onChange={(value) => setPassword(value)}>
                        <TextFieldLabel>{t('Password')}</TextFieldLabel>
                        <TextFieldInput type="password"/>
                    </TextField>
                    <Show when={login.data.error}>
                        <div class="text-red-500 flex items-center">
                            <AlertCircle class="w-4 h-4 mr-2"/>
                            {login.data.error.detail}
                        </div>
                    </Show>
                    <Button type="submit" class="w-full" disabled={login.data.loading}>
                        {login.data.loading ? <Oval width="24" height="24"/> : "Sign In"}
                    </Button>
                </form>
                <div class="mt-4 text-center">
                    <A href="/login/forgot-password" class="text-sm text-primary hover:underline">
                        {t('ForgotPassword')}
                    </A>
                </div>
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
                    {t('DontHaveAccount')}{" "}
                    <A href="/registration" class="text-primary underline">
                        {t('SignUpTo')}
                    </A>
                </div>
                <Show when={externalLogin.data.loading}>
                    <div id="overlay"
                         class="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-40 w-screen h-screen top-0 left-0">
                        <span class="text-white">{t("CompleteLogin")}</span>
                    </div>
                </Show>

            </CardFooter>
        </Card>
    )
}

export default Login;