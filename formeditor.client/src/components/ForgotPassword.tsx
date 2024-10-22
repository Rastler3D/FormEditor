import {createSignal} from 'solid-js';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {TextField, TextFieldInput, TextFieldLabel} from '~/components/ui/text-field';
import {A} from '@solidjs/router';
import {forgotPassword} from '~/services/userService';
import {AlertCircle, CheckCircle} from 'lucide-solid';
import {createAction} from "../lib/action";

export default function ForgotPassword() {
    const [email, setEmail] = createSignal('');
    const forgot = createAction(forgotPassword)

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        forgot(email());
    };

    return (
        <div class="min-h-screen bg-background flex items-center justify-center p-4">
            <Card class="w-full max-w-md">
                <CardHeader>
                    <CardTitle class="text-2xl font-bold text-center">Forgot Password</CardTitle>
                    <CardDescription class="text-center">
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} class="space-y-4">
                        <TextField value={email()}
                                   onChange={(value) => setEmail(value)}>
                            <TextFieldLabel>Email</TextFieldLabel>
                            <TextFieldInput
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </TextField>
                        {forgot.data.error && (
                            <div class="text-red-500 flex items-center">
                                <AlertCircle class="w-4 h-4 mr-2"/>
                                {forgot.data.error}
                            </div>
                        )}
                        {!forgot.data.error && forgot.data() && (
                            <div class="text-green-500 flex items-center">
                                <CheckCircle class="w-4 h-4 mr-2"/>
                                Password reset link sent successfully!
                            </div>
                        )}
                        <Button type="submit" class="w-full" disabled={forgot.data.loading}>
                            {forgot.data.loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter class="flex justify-center">
                    <Button as={A} href="/login" variant="link">
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}