
import {ColumnDef} from "@tanstack/solid-table";
import {A} from '@solidjs/router';
import DataTable from '~/components/DataTable';
import {Button} from '~/components/ui/button';
import {FormInfo, TableOption} from '~/types/template';
import {deleteForm} from '~/services/templateService.ts';
import {showToast} from "../components/ui/toast";
import {createTrigger} from '@solid-primitives/trigger';

interface FormManagementProps {
    templateFetcher: (options: TableOption) => Promise<{ data: FormInfo[]; totalPages: number }>;
    name?: string;
}

export default function FormManagement(props: FormManagementProps) {

    const columns: ColumnDef<FormInfo, any>[] = [
        {
            accessorKey: 'templateName',
            header: 'Template Name',
            cell: (info) => <A href={`/template/${info.row.original.id}`}
                               class="text-primary hover:underline">{info.getValue()}</A>,
        },
        {
            accessorKey: 'submittedBy',
            header: 'Submitted By',
        },
        {
            accessorKey: 'fillingDate',
            header: 'Filling Date',
            cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
        },
        {
            id: 'actions',
            cell: (info) => (
                <div class="flex gap-2">
                    <Button as={A} href={`/form/${info.row.original.id}`} size="sm">
                        View
                    </Button>
                    <Button size="sm" onClick={() => handleDeleteForm(info.row.original.id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const [track, trigger] = createTrigger();
    const handleDeleteForm = async (formId: number) => {
        try {
            await deleteForm(formId);

            trigger();
            showToast({title: `Deleted form ${formId}`, variant: "default"});
        } catch (error) {
            showToast({title: "Failed to delete form", variant: "destructive"});
        }
    };

    return (
        <div class="container mx-auto p-4">
            <h1 class="text-3xl font-bold mb-4">{props.name?? "Forms"}</h1>
            <DataTable
                columns={columns}
                fetchData={props.templateFetcher}
                isSelectable={false}
                refetchTrigger={track}
            />
        </div>
    );
}