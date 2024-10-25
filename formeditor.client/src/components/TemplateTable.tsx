import {children, For} from 'solid-js';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import {Card} from './ui/card';
import {TemplateInfo} from "~/types/template.ts";
import {Skeleton} from "@kobalte/core/skeleton";
import {useNavigate} from "@solidjs/router";
import {SolidMarkdown} from "solid-markdown";
import {Badge} from "~/components/ui/badge.tsx";
import { Calendar, Eye, Heart, User } from 'lucide-solid';

interface TemplateTableProps {
    templates?: TemplateInfo[];
    isLoading: boolean;
}

function TemplateTable(props: TemplateTableProps) {
    const navigate = useNavigate();

    return (
        <Card class="overflow-hidden">
            <div class="overflow-x-auto">
                <Accordion multiple>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead class="w-[30%]">Name</TableHead>
                                <TableHead class="w-[20%] hidden md:table-cell">Author</TableHead>
                                <TableHead class="w-[20%] hidden lg:table-cell">Topic</TableHead>
                                <TableHead class="w-[15%] hidden sm:table-cell">Created At</TableHead>
                                <TableHead class="w-[10%]">Filled forms</TableHead>
                                <TableHead class="w-[5%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.isLoading ? (
                                <For each={Array(5).fill(null)}>
                                    {() => (
                                        <TableRow class="animate-pulse">
                                            <For each={Array(6).fill(null)}>
                                                {(_, index) => (
                                                    <TableCell
                                                        class={index() > 0 && index() < 4 ? "hidden sm:table-cell" : ""}>
                                                        <Skeleton class="!h-6 !w-full"/>
                                                    </TableCell>
                                                )}
                                            </For>
                                        </TableRow>
                                    )}
                                </For>
                            ) : (
                                <For each={props.templates}>
                                    {(template) => (
                                        <AccordionItem as={empty} value={`${template.id}`}>
                                            <>
                                                <TableRow
                                                    class="cursor-pointer"
                                                    onClick={() => navigate(`/templates/${template.id}`)}
                                                >
                                                    <TableCell class="w-[30%]">{template.name}</TableCell>
                                                    <TableCell
                                                        class="w-[20%] hidden md:table-cell">{template.createdBy}</TableCell>
                                                    <TableCell
                                                        class="w-[20%] hidden lg:table-cell">{template.topic}</TableCell>
                                                    <TableCell
                                                        class="w-[15%] hidden sm:table-cell">{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell class="w-[10%]">{template.filledCount}</TableCell>
                                                    <TableCell class="w-[5%]">
                                                        <AccordionTrigger onClick={(e) => e.stopPropagation()}/>
                                                    </TableCell>
                                                </TableRow>
                                                <AccordionContent as={empty} >
                                                    <TableRow>
                                                        <TableCell colSpan={7} class="bg-muted/50 p-6">
                                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div class="space-y-4">
                                                                    <h4 class="text-lg font-bold">Description</h4>
                                                                    <div class="prose dark:prose-invert">
                                                                        <SolidMarkdown>{template.description}</SolidMarkdown>
                                                                    </div>
                                                                    <h4 class="text-lg font-bold">Tags</h4>
                                                                    <div class="flex flex-wrap gap-2">
                                                                        <For each={template.tags}>
                                                                            {(tag) => (
                                                                                <Badge variant="default">{tag}</Badge>
                                                                            )}
                                                                        </For>
                                                                    </div>
                                                                    <div class="flex items-center space-x-4">
                                                                        <div class="flex items-center">
                                                                            <Calendar class="w-4 h-4 mr-1" />
                                                                            <span class="text-sm">Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <div class="flex items-center">
                                                                            <User class="w-4 h-4 mr-1" />
                                                                            <span class="text-sm">By: {template.createdBy}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="flex items-center space-x-4">
                                                                        <div class="flex items-center">
                                                                            <Eye class="w-4 h-4 mr-1" />
                                                                            <span class="text-sm">Filled: {template.filledCount} times</span>
                                                                        </div>
                                                                        <div class="flex items-center">
                                                                            <Heart class="w-4 h-4 mr-1 text-red-500" />
                                                                            <span class="text-sm">Likes: {template.likes}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="space-y-4 row-start-1 md:row-auto">
                                                                    <h4 class="text-lg font-bold">Preview</h4>
                                                                    <img
                                                                        src={template.image || '/placeholder.svg?height=200&width=300'}
                                                                        alt={template.name}
                                                                        class="w-full h-48 object-cover rounded-md"
                                                                        classList={{"dark:invert": !template.image}}
                                                                    />
                                                                    
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                </AccordionContent>
                                            </>
                                        </AccordionItem>
                                    )}
                                </For>
                            )}
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