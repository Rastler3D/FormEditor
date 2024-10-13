﻿import { TemplateInfo } from "~/types/template";
import {Card, CardContent, CardFooter} from "~/components/ui/card";
import {Badge} from "~/components/ui/badge";
import {FaSolidHeart} from "solid-icons/fa";
import {A} from "@solidjs/router";
import {For} from "solid-js";
import {Skeleton} from "~/components/ui/skeleton";

interface TemplateCardProps {
    template: TemplateInfo;
}

const TemplateCard = (props: TemplateCardProps) => {

    return (
        <A href={`/template/${props.template.id}`} class="block">
            <Card class="overflow-hidden w-[300px] h-[400px] transition-shadow hover:shadow-lg">
                <div class="relative h-[180px]">
                    <img
                        src={props.template.image || '/placeholder.svg?height=180&width=300'}
                        alt={props.template.name}
                        class="w-full h-full object-cover"
                    />
                    <div class="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                        <FaSolidHeart class="w-4 h-4 text-primary mr-1" />
                        <span class="text-sm font-medium">{props.template.likes}</span>
                    </div>
                </div>
                <CardContent class="p-4 h-[180px] overflow-hidden">
                    <h3 class="text-lg font-semibold mb-2 line-clamp-1">{props.template.name}</h3>
                    <p class="text-sm text-muted-foreground mb-3 line-clamp-3">{props.template.description}</p>
                    <div class="flex flex-wrap gap-2">
                        <For each={props.template.tags.slice(0, 3)}>
                            {(tag) => <Badge variant="secondary" class="truncate max-w-[80px]">{tag}</Badge>}
                        </For>
                        {props.template.tags.length > 3 && (
                            <Badge variant="outline">+{props.template.tags.length - 3}</Badge>
                        )}
                    </div>
                </CardContent>
                <CardFooter class="flex justify-between items-center p-4 bg-muted/50">
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
        <Card class="overflow-hidden w-[300px] h-[400px]">
            <Skeleton class="h-[180px] w-full" />
            <CardContent class="p-4 h-[180px]">
                <Skeleton class="h-6 w-3/4 mb-2" />
                <Skeleton class="h-4 w-full mb-2" />
                <Skeleton class="h-4 w-5/6 mb-3" />
                <div class="flex gap-2">
                    <Skeleton class="h-6 w-16" />
                    <Skeleton class="h-6 w-16" />
                    <Skeleton class="h-6 w-16" />
                </div>
            </CardContent>
            <CardFooter class="flex justify-between items-center p-4 bg-muted/50">
                <Skeleton class="h-4 w-24" />
            </CardFooter>
        </Card>
    );
};
