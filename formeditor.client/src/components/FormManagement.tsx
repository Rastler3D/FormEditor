import {ColumnDef} from "@tanstack/solid-table";
import {A, useNavigate} from '@solidjs/router';
import DataTable from '~/components/DataTable';
import {Button} from '~/components/ui/button';
import {FormInfo, TableData, TableOption} from '~/types/types.ts';
import {deleteForm} from '~/services/formService.ts';
import {showToast} from "../components/ui/toast";
import {createTrigger} from '@solid-primitives/trigger';
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import {Clock, Eye, FileText, MoreHorizontal, Trash, User} from "lucide-solid";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";

interface FormManagementProps {
    formFetcher: (options: TableOption) => Promise<TableData<FormInfo[]>>;
    name?: string;
}

export default function FormManagement(props: FormManagementProps) {
    const [track, trigger] = createTrigger();
    const navigate = useNavigate();

    const columns: ColumnDef<FormInfo, any>[] = [
        {
            accessorKey: 'templateName',
            header: 'Template Name',
            cell: (info) => (
                <A href={`/forms/${info.row.original.id}`} class="text-primary hover:underline flex items-center space-x-2">
                    <FileText class="h-4 w-4"/>
                    <span>{info.getValue()}</span>
                </A>
            ),
        },
        {
            accessorKey: 'submittedBy',
            header: 'Submitted By',
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <User class="h-4 w-4 text-muted-foreground"/>
                    <span>{info.getValue()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'fillingDate',
            header: 'Filling Date',
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <Clock class="h-4 w-4 text-muted-foreground"/>
                    <span>{new Date(info.getValue() as string).toLocaleString()}</span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: (info) => (
                <DropdownMenu>
                    <DropdownMenuTrigger as={Button} variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent  class="w-48">
                        <DropdownMenuItem class="cursor-pointer" onSelect={() => navigate(`/forms/${info.row.original.id}`)}>
                            <Eye class="mr-2 h-4 w-4"/>
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem class="cursor-pointer" onSelect={() => handleDeleteForm(info.row.original.id)}>
                            <Trash class="mr-2 h-4 w-4"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleDeleteForm = async (formId: number) => {
        try {
            await deleteForm(formId);
            trigger();
            showToast({title: `Deleted form ${formId}`, variant: "success"});
        } catch (error) {
            showToast({title: "Failed to delete form", variant: "destructive"});
        }
    };

    return (
        <Card class="bg-background">
            <CardHeader>
                <CardTitle>{props.name ?? "Forms"}</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    fetchData={props.formFetcher}
                    isSelectable={false}
                    refetchTrigger={track}
                    rowId="id"
                />
            </CardContent>
        </Card>
    );
}