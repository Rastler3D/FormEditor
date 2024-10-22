import {For} from 'solid-js';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table.tsx";
import {Skeleton} from "~/components/ui/skeleton.tsx";
import {useNavigate} from "@solidjs/router";
import {TemplateInfo} from "~/types/template.ts";

interface PopularTemplateProps {
    templates?: TemplateInfo[],
    isLoading: boolean;
}

const PopularTemplates = (props: PopularTemplateProps) => {
    const navigate = useNavigate();
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead class="w-[100px]">Rank</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead class="text-right">FilledForms</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {props.isLoading ? (
                    <For each={Array(5).fill(null)}>
                        {() => (
                            <TableRow class="transition-colors duration-200">
                                <For each={Array(4).fill(null)}>
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
                    <For each={props.templates}>
                        {(template, index) => (
                            <TableRow
                                class="hover:bg-accent transition-colors duration-200 cursor-pointer"
                                onClick={() => navigate(`/templates/${template.id}`)}
                            >
                                <TableCell>{index() + 1}</TableCell>
                                <TableCell>{template.name}</TableCell>
                                <TableCell>{template.createdBy}</TableCell>
                                <TableCell>{template.filledCount}</TableCell>
                            </TableRow>
                        )}
                    </For>
                )}
            </TableBody>
        </Table>
    );
};

export default PopularTemplates;