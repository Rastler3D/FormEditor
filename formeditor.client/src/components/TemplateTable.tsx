import {For} from 'solid-js';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import {Card} from './ui/card';
import {TemplateInfo} from "~/types/template.ts";
import {Skeleton} from "@kobalte/core/skeleton";
import {useNavigate} from "@solidjs/router";
import {SolidMarkdown} from "solid-markdown";

interface TemplateTableProps {
    templates?: TemplateInfo[];
    isLoading: boolean;
}

function TemplateTable(props: TemplateTableProps) {
    const navigate = useNavigate();

    return (
        <Card class="overflow-hidden">
            <div class="overflow-x-auto">
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
                                                <TableCell class={index() > 0 && index() < 4 ? "hidden sm:table-cell" : ""}>
                                                    <Skeleton class="h-6 w-full" />
                                                </TableCell>
                                            )}
                                        </For>
                                    </TableRow>
                                )}
                            </For>
                        ) : (
                            <Accordion multiple asChild>
                                <For each={props.templates}>
                                    {(template) => (
                                        <AccordionItem value={`${template.id}`} asChild>
                                            <TableRow
                                                class="cursor-pointer"
                                                onClick={() => navigate(`/templates/${template.id}`)}
                                            >
                                                <TableCell class="w-[30%]">{template.name}</TableCell>
                                                <TableCell class="w-[20%] hidden md:table-cell">{template.createdBy}</TableCell>
                                                <TableCell class="w-[20%] hidden lg:table-cell">{template.topic}</TableCell>
                                                <TableCell class="w-[15%] hidden sm:table-cell">{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell class="w-[10%]">{template.filledCount}</TableCell>
                                                <TableCell class="w-[5%]">
                                                    <AccordionTrigger onClick={(e) => e.stopPropagation()} />
                                                </TableCell>
                                            </TableRow>
                                            <AccordionContent asChild>
                                                <TableRow>
                                                    <TableCell colSpan={6} class="bg-muted/50 p-4">
                                                        <div class="space-y-4">
                                                            <h4 class="font-bold">Description</h4>
                                                            <div class="prose dark:prose-invert">
                                                                <SolidMarkdown>{template.description}</SolidMarkdown>
                                                            </div>
                                                            <h4 class="font-bold">Tags</h4>
                                                            <div class="flex flex-wrap gap-2">
                                                                <For each={template.tags}>
                                                                    {(tag) => (
                                                                        <span class="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                      {tag}
                                    </span>
                                                                    )}
                                                                </For>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )}
                                </For>
                            </Accordion>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}

export default TemplateTable;