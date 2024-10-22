import {For, createSignal, JSX} from 'solid-js';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import {Card} from './ui/card';
import {TemplateInfo} from "~/types/template.ts";
import {Skeleton} from "@kobalte/core/skeleton";
import {useNavigate} from "@solidjs/router";
import {SolidMarkdown} from "solid-markdown";

interface TemplateTableProps {
    templates?: TemplateInfo[],
    isLoading: boolean;
}

function TemplateTable(props: TemplateTableProps) {
    const navigate = useNavigate();

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Filled forms</TableHead>
                        <TableHead class="text-right w-[40px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.isLoading ? (
                        <For each={Array(5).fill(null)}>
                            {() => (
                                <TableRow class="transition-colors duration-200">
                                    <For each={Array(5).fill(null)}>
                                        {() => (
                                            <TableCell>
                                                <Skeleton class="h-6 w-full"/>
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
                                            class="hover:bg-accent transition-colors duration-200 cursor-pointer"
                                            onClick={() => navigate(`/templates/${template.id}`)}
                                        >
                                            <TableCell>{template.name}</TableCell>
                                            <TableCell>{template.createdBy}</TableCell>
                                            <TableCell>{template.topic}</TableCell>
                                            <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{template.filledCount}</TableCell>
                                            <TableCell><AccordionTrigger/></TableCell>
                                        </TableRow>
                                        <AccordionContent asChild>
                                            <TableRow>
                                                <TableCell colSpan={5} class="bg-gray-50">
                                                    <div class="p-4">
                                                        <h4 class="font-bold mb-2">Description</h4>
                                                        <p><SolidMarkdown>{template.description}</SolidMarkdown></p>
                                                        <h4 class="font-bold mt-4 mb-2">Tags</h4>
                                                        <div class="flex flex-wrap gap-1">
                                                            <For each={template.tags}>
                                                                {(tag) => <span
                                                                    class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{tag}</span>}
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
        </Card>
    )
}

export default TemplateTable;