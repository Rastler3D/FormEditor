import { Button } from "~/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { FaBrandsGoogle, FaBrandsGithub } from 'solid-icons/fa';
import { A, useNavigate } from '@solidjs/router';
import { useAuth } from "../contexts/AuthContext";
import {createAction, resolve} from "../lib/action";
import { AlertCircle } from "lucide-solid";
import { createEffect, createSignal,  Show } from "solid-js";
import { Oval } from "solid-spinner";

const Login = () => {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const login = createAction(signIn);
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");

    createEffect(resolve(login.data, () => navigate("/home")));

    const handleLogin = (e: SubmitEvent) => {
        e.preventDefault();
        login({email: email(), password: password()})
    }

    return (
        <Card class="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle class="text-2xl font-bold">Sign In</CardTitle>
                <CardDescription>
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} class="space-y-4">
                    <TextField required value={email()} onChange={(value) => setEmail(value)}>
                        <TextFieldLabel>Email</TextFieldLabel>
                        <TextFieldInput type="email" placeholder="m@example.com"/>
                    </TextField>
                    <TextField required value={password()} onChange={(value) => setPassword(value)}>
                        <TextFieldLabel>Password</TextFieldLabel>
                        <TextFieldInput type="password"/>
                    </TextField>
                    <Show when={login.data.error}>
                        <div class="text-red-500 flex items-center">
                            <AlertCircle class="w-4 h-4 mr-2"/>
                            {login.data.error.detail}
                        </div>
                    </Show>
                    <Button type="submit" class="w-full" disabled={login.data.loading}>
                        {login.data.loading ? <Oval width="24" height="24" /> : "Sign In"}
                    </Button>
                </form>
                <div class="mt-4 text-center">
                    <A href="/login/forgot-password" class="text-sm text-primary hover:underline">
                        Forgot password?
                    </A>
                </div>
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"/>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <Button variant="outline" type="button" class="w-full">
                        <FaBrandsGithub class="mr-2 h-4 w-4"/>
                        Github
                    </Button>
                    <Button variant="outline" type="button" class="w-full">
                        <FaBrandsGoogle class="mr-2 h-4 w-4"/>
                        Google
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <div class="text-center text-sm w-full">
                    Don't have an account?{" "}
                    <A href="/registration" class="text-primary underline">
                        Sign up
                    </A>
                </div>
            </CardFooter>
        </Card>
    )
}

export default Login;