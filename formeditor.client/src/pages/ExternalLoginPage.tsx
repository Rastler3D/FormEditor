import {useNavigate, useSearchParams} from "@solidjs/router";
import {createEffect, Show} from "solid-js";
import {ExternalLoginResponse, TokenResponse} from "../types/types";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import {AlertCircle, Check} from "lucide-solid";

const ExternalLoginPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    createEffect(() => {
        if (window.opener) {
            const error = params.error;
            const token: TokenResponse = {
                accessToken: params.accessToken,
                refreshToken: params.refreshToken,
                expiresIn: Number(params.expiresIn),
            }
            const message: ExternalLoginResponse = error ? {
                type: "error",
                message: error,
            } : {
                type: "success",
                message: token
            };
            window.opener.postMessage(message, '*');
            window.close();
        } else {
            navigate("/home")
        }
    })

    return (
        <div class="min-h-screen bg-background flex justify-center items-baseline p-4">
            <Card class="w-full max-w-md">
                <Show
                    when={!params.error}
                    fallback={
                        <>
                            <CardHeader>
                                <CardTitle class="text-2xl font-bold text-center">Authentication Failed</CardTitle>
                                <CardDescription class="text-center">
                                    There was a problem signing you in
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="text-center space-y-4">
                                <div class="mx-auto rounded-full bg-red-100 p-3 w-16 h-16 flex items-center justify-center">
                                    <AlertCircle class="h-8 w-8 text-red-600"/>
                                </div>
                                <div class="text-red-500 flex items-center justify-center">
                                    <AlertCircle class="w-4 h-4 mr-2"/>
                                    {params.error}
                                </div>
                            </CardContent>
                        </>
                    }
                >
                    <CardHeader>
                        <CardTitle class="text-2xl font-bold text-center">Authentication Successful</CardTitle>
                        <CardDescription class="text-center">
                            You have successfully signed in
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="text-center space-y-4">
                        <div class="mx-auto rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center">
                            <Check class="h-8 w-8 text-green-600"/>
                        </div>
                        <p>
                            Successful authentication! This window will be closed automatically.
                        </p>
                        
                    </CardContent>
                </Show>
            </Card>
        </div>
    );
}

export default ExternalLoginPage;