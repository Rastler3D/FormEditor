import {Button} from "~/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription, CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import {TextField, TextFieldInput, TextFieldLabel} from "./ui/text-field";
import { FaBrandsGoogle, FaBrandsGithub } from 'solid-icons/fa';
import { A } from '@solidjs/router';
import {useAuth} from "../contexts/AuthContext";
import {createAction} from "../lib/action";
import { AlertCircle } from "lucide-solid";
export default function Login() {
    const {signIn, } = useAuth();
    const login = createAction(signUp);
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    
    return (
        <Card class="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle class="text-xl">Sign In</CardTitle>
                <CardDescription>
                    Enter your email and password below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="grid gap-4">
                    <div class="grid gap-2">
                        <TextField required value={email} onChange={(value) => setEmail(value)} >
                            <TextFieldLabel>Email</TextFieldLabel>
                            <TextFieldInput type="email" placeholder="m@example.com"/>
                        </TextField>
                    </div>
                    <div class="grid gap-2">
                        <TextField required value={password} onChange={(value) => setPassword(value)} >
                            <TextFieldLabel>Password</TextFieldLabel>
                            <TextFieldInput type="password"/>
                        </TextField>
                    </div>
                <Show when={login.data.error}>
                    <div className="grid gap-2">
                        <div className="text-red-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2"/>
                            {login.data.error}
                        </div>
                    </div>
                </Show>
                <div class="grid gap-2">
                    <Button onClick={login({userName, email, password})} class="w-full">
                        Create an account
                    </Button>
                </div>
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <span class="w-full border-t"/>
                        </div>
                        <div class="relative flex justify-center text-xs uppercase">
                            <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <Button variant="outline">
                            <FaBrandsGithub class="mr-2 size-4"/>
                            Github
                        </Button>
                        <Button variant="outline">
                            <FaBrandsGoogle class="mr-2 size-4"/>
                            Google
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div class="mt-4 text-center text-sm">
                    Don't have an account?{" "}
                    <A href="/login" class="underline">
                        Sign up
                    </A>
                </div>
            </CardFooter>
        </Card>
    )
}