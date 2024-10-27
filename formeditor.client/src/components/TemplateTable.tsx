import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import {Card} from './ui/card';
import {TemplateInfo} from "~/types/types.ts";
import {useNavigate} from "@solidjs/router";
import {SolidMarkdown} from "solid-markdown";
import {Badge} from "~/components/ui/badge.tsx";
import {Calendar, Eye, Heart, User, ChevronRight} from 'lucide-solid';
import {children, For} from 'solid-js';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import {Skeleton} from "~/components/ui/skeleton.tsx";

interface TemplateTableProps {
    templates?: TemplateInfo[];
    isLoading: boolean;
}

function TemplateTable(props: TemplateTableProps) {
    const navigate = useNavigate();

    const TableSkeleton = () => (

        <For each={Array(5).fill(null)}>
            {() => (
                <TableRow class="animate-pulse">
                    <TableCell class="w-[35%] sm:w-[30%] font-semibold"><Skeleton class="!h-6 !w-full"/></TableCell>
                    <TableCell class="hidden md:table-cell font-semibold"><Skeleton class="!h-6 !w-full"/></TableCell>
                    <TableCell class="hidden lg:table-cell font-semibold"><Skeleton class="!h-6 !w-full"/></TableCell>
                    <TableCell class="hidden sm:table-cell font-semibold"><Skeleton class="!h-6 !w-full"/></TableCell>
                    <TableCell class="font-semibold"><Skeleton class="!h-6 !w-full"/></TableCell>
                    <TableCell class="text-end font-semibold"><Skeleton class="!h-6 !w-full"/></TableCell>
                </TableRow>
            )}
        </For>
    );

    return (
        <Card class="overflow-hidden bg-card">
            <div class="overflow-x-auto">
                <Accordion multiple class="w-full">
                    <Table>
                        <TableHeader>
                            <TableRow class="border-b border-border/50 hover:bg-transparent">
                                <TableHead class="w-[35%] sm:w-[30%] font-semibold">Name</TableHead>
                                <TableHead class="hidden md:table-cell font-semibold">Author</TableHead>
                                <TableHead class="hidden lg:table-cell font-semibold">Topic</TableHead>
                                <TableHead class="hidden sm:table-cell font-semibold">Created</TableHead>
                                <TableHead class="font-semibold">Filled</TableHead>
                                <TableHead class="w-10 text-end font-semibold">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <Show when={!props.isLoading} fallback={<TableSkeleton/>}>
                                <For each={props.templates}>
                                    {(template) => (
                                        <AccordionItem as={empty} value={`${template.id}`}>
                                            <>
                                                <TableRow
                                                    class="cursor-pointer transition-colors hover:bg-muted/50"
                                                    onClick={() => navigate(`/templates/${template.id}`)}
                                                >
                                                    <TableCell class="font-medium">
                                                        <div class="flex items-center space-x-2">
                                                            <div
                                                                class="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={template.image || '/placeholder.svg?height=32&width=32'}
                                                                    alt=""
                                                                    class="w-full h-full object-cover"
                                                                    classList={{"dark:invert": !template.image}}
                                                                />
                                                            </div>
                                                            <span class="line-clamp-1">{template.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell class="hidden md:table-cell text-muted-foreground">
                                                        {template.createdBy}
                                                    </TableCell>
                                                    <TableCell class="hidden lg:table-cell">
                                                        <Badge variant="secondary" class="font-normal">
                                                            {template.topic}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell class="hidden sm:table-cell text-muted-foreground">
                                                        {new Date(template.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div class="flex items-center space-x-1">
                                                            <Eye class="w-4 h-4 text-muted-foreground"/>
                                                            <span>{template.filledCount}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell class="text-end px-4">
                                                        <AccordionTrigger
                                                            class="h-full px-4 hover:bg-muted/50 transition-colors rounded"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                        </AccordionTrigger>
                                                    </TableCell>
                                                </TableRow>
                                                <AccordionContent as={empty}>
                                                    <TableRow>
                                                        <TableCell colSpan={7} class="p-0">
                                                            <div class="bg-muted/30 p-6 space-y-6">
                                                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    <div class="space-y-6">
                                                                        <div>
                                                                            <h4 class="text-lg font-semibold mb-3">Description</h4>
                                                                            <div
                                                                                class="prose dark:prose-invert max-w-none">
                                                                                <SolidMarkdown>{template.description}</SolidMarkdown>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 class="text-lg font-semibold mb-3">Tags</h4>
                                                                            <div class="flex flex-wrap gap-2">
                                                                                <For each={template.tags}>
                                                                                    {(tag) => (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            class="px-2.5 py-0.5 text-xs font-medium bg-background hover:bg-muted/50 transition-colors"
                                                                                        >
                                                                                            {tag}
                                                                                        </Badge>
                                                                                    )}
                                                                                </For>
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                            <div class="space-y-3">
                                                                                <div
                                                                                    class="flex items-center space-x-2 text-muted-foreground">
                                                                                    <Calendar class="w-4 h-4"/>
                                                                                    <span class="text-sm">
                                                                                        Created: {new Date(template.createdAt).toLocaleDateString()}
                                                                                    </span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center space-x-2 text-muted-foreground">
                                                                                    <User class="w-4 h-4"/>
                                                                                    <span
                                                                                        class="text-sm">By: {template.createdBy}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="space-y-3">
                                                                                <div
                                                                                    class="flex items-center space-x-2 text-muted-foreground">
                                                                                    <Eye class="w-4 h-4"/>
                                                                                    <span class="text-sm">
                                                                                        Filled: {template.filledCount} times
                                                                                    </span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center space-x-2">
                                                                                    <Heart
                                                                                        class="w-4 h-4 text-red-500"/>
                                                                                    <span class="text-sm">
                                                                                        Likes: {template.likes}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div class="space-y-4  row-start-1 md:row-auto">
                                                                        <h4 class="text-lg font-semibold">Preview</h4>
                                                                        <div
                                                                            class="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                                                            <img
                                                                                src={template.image || '/placeholder.svg?height=400&width=600'}
                                                                                alt={template.name}
                                                                                class="w-full h-full object-cover"
                                                                                classList={{"dark:invert": !template.image}}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                </AccordionContent>
                                            </>
                                        </AccordionItem>
                                    )}
                                </For>
                            </Show>
                        </TableBody>
                    </Table>
                </Accordion>
            </div>
        </Card>
    );
}

export default TemplateTable;

const empty = (props: { children: any }) => {
    const child = children(() => props.children);
    return <>{child()}</>;
}