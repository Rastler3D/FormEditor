import {Card, CardContent, CardFooter} from "~/components/ui/card";
import {Button} from "~/components/ui/button";
import {useLanguage} from "~/contexts/LanguageContext";
import {Check, X} from "lucide-solid";
import {Show} from "solid-js";
import {Oval} from "solid-spinner";


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
        <Card class="flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg overflow-hidden">
            <CardContent class="p-6 flex-grow">
                <h4 class="text-xl font-semibold mb-3">{props.title}</h4>
                <p class="text-sm text-muted-foreground">{props.description}</p>
            </CardContent>
            <CardFooter class="p-6 bg-muted/50 border-t">
                <Show
                    when={!props.loading}
                    fallback={
                        <div class="w-full flex items-center justify-center">
                            <Oval width="24" height="24"/>
                        </div>
                    }
                >
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center space-x-2">
                            <div class={`p-1 rounded-full ${props.connected ? "bg-green-100" : "bg-red-100"}`}>
                                {props.connected ? (
                                    <Check class="w-4 h-4 text-green-600"/>
                                ) : (
                                    <X class="w-4 h-4 text-red-600"/>
                                )}
                            </div>
                            <span
                                class={`font-medium ${
                                    props.connected ? "text-green-600" : "text-red-600"
                                }`}
                            >
                {props.connected ? t("Connected") : t("Disconnected")}
              </span>
                        </div>
                        <Button
                            onClick={props.onToggle}
                            variant={props.connected ? "destructive" : "default"}
                            class="ml-4 transition-all duration-300 hover:shadow-md"
                            size="sm"
                        >
                            {props.connected ? t("Info") : t("Connect")}
                        </Button>
                    </div>
                </Show>
            </CardFooter>
        </Card>
    );
}

export default IntegrationCard;