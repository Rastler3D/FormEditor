import {Card, CardContent, CardFooter} from "~/components/ui/card";
import {Button} from "~/components/ui/button";
import {useLanguage} from "~/contexts/LanguageContext";
import {Check, X} from "lucide-solid";
import {Show} from "solid-js";
import { Oval } from "solid-spinner";

interface IntegrationCardProps {
    title: string;
    description: string;
    connected?: boolean;
    loading: boolean;
    onToggle: () => void;
}

function IntegrationCard(props: IntegrationCardProps) {
    const {t} = useLanguage();

    return (
        <Card class="flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg">
            <CardContent class="p-6">
                <h4 class="text-xl font-semibold mb-3">{props.title}</h4>
                <p class="text-sm text-muted-foreground">{props.description}</p>
            </CardContent>
            <CardFooter class="p-6 bg-muted/50">
                <Show when={!props.loading} fallback={<Oval width="24" height="24"/>}>
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center">
                            {props.connected ? (
                                <Check class="w-5 h-5 text-green-500 mr-2"/>
                            ) : (
                                <X class="w-5 h-5 text-red-500 mr-2"/>
                            )}
                            <span class={`font-medium ${props.connected ? "text-green-500" : "text-red-500"}`}>
                              {props.connected ? t("Connected") : t("Disconnected")}
                            </span>
                        </div>
                        <Button
                            onClick={props.onToggle}
                            variant={props.connected ? "destructive" : "default"}
                            class="ml-4"
                        >
                            {props.connected ? t("Disconnect") : t("Connect")}
                        </Button>
                    </div>

                </Show>
            </CardFooter>
        </Card>
    );
}

export default IntegrationCard;