import { TemplateInfo } from "~/types/template";
import {Card, CardContent, CardFooter} from "~/components/ui/card";
import {Badge} from "~/components/ui/badge";
import {A} from "@solidjs/router";
import {For} from "solid-js";
import {Skeleton} from "~/components/ui/skeleton";
import {SolidMarkdown} from "solid-markdown";
import { Heart } from "lucide-solid";

interface TemplateCardProps {
    template: TemplateInfo;
}

const TemplateCard = (props: TemplateCardProps) => {
    return (
        <A href={`/templates/${props.template.id}`} class="block w-full h-full">
            <Card class="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col">
                <div class="relative aspect-video">
                    <img
                        src={props.template.image || '/placeholder.svg?height=180&width=300'}
                        alt={props.template.name}
                        class="w-full h-full object-cover rounded-t-lg"
                        classList={{"dark:invert": !props.template.image}}
                    />
                    <div class="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                        <Heart class="w-4 h-4 text-primary mr-1" />
                        <span class="text-sm font-medium">{props.template.likes}</span>
                    </div>
                </div>
                <CardContent class="p-4 flex-grow flex flex-col">
                    <h3 class="text-lg font-semibold mb-2 line-clamp-1">{props.template.name}</h3>
                    <div class="text-sm text-muted-foreground mb-3 line-clamp-3 prose dark:prose-invert flex-grow">
                        <SolidMarkdown>{props.template.description}</SolidMarkdown>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-auto">
                        <For each={props.template.tags.slice(0, 3)}>
                            {(tag) => <Badge variant="secondary" class="truncate max-w-[80px]">{tag}</Badge>}
                        </For>
                        {props.template.tags.length > 3 && (
                            <Badge variant="outline">+{props.template.tags.length - 3}</Badge>
                        )}
                    </div>
                </CardContent>
                <CardFooter class="flex justify-between items-center p-4 bg-muted/50 mt-auto">
                    <div class="text-sm text-muted-foreground">
                        Filled count: {props.template.filledCount}
                    </div>
                </CardFooter>
            </Card>
        </A>
    );
};

export default TemplateCard;

export const TemplateSkeleton = () => {
    return (
        <Card class="h-full flex flex-col">
            <Skeleton class="!aspect-video !w-full !rounded-t-lg" />
            <CardContent class="p-4 space-y-4 flex-grow flex flex-col">
                <Skeleton class="!h-6 !w-3/4" />
                <Skeleton class="!h-4 !w-full flex-grow" />
                <div class="flex gap-2 mt-auto">
                    <Skeleton class="!h-6 !w-16" />
                    <Skeleton class="!h-6 !w-16" />
                    <Skeleton class="!h-6 !w-16" />
                </div>
            </CardContent>
            <CardFooter class="flex justify-between items-center p-4 bg-muted/50">
                <Skeleton class="!h-4 !w-24" />
            </CardFooter>
        </Card>
    );
};
