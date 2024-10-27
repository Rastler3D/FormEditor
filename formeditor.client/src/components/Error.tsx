import {Alert, AlertDescription, AlertTitle} from "./ui/alert";
import {AlertCircle} from "lucide-solid";
import {Button} from "./ui/button";
import {createEffect} from "solid-js";

export const Error = (props: { error: string, reset: () => void }) => {
    createEffect(() => {
        console.error(props.error);
    });

    return (
        <div class="flex justify-center items-center w-full h-full mt-28">
            <Alert class="w-auto flex items-center gap-3 flex-col">
                <AlertCircle class="h-4 w-4"/>
                <AlertTitle>Oops! Something went wrong. Unexpected error.</AlertTitle>
                <AlertDescription>
                    <Button onClick={props.reset}>Try again</Button>
                </AlertDescription>
            </Alert>
        </div>
    )
} 