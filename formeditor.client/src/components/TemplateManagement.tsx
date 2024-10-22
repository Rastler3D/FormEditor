import {ColumnDef} from "@tanstack/solid-table";
import {A} from '@solidjs/router';
import DataTable from '~/components/DataTable';
import {Button} from '~/components/ui/button';
import {TableData, TableOption, TemplateInfo} from '~/types/template';
import {deleteTemplate, fetchUsers} from '~/services/templateService.ts';
import {showToast} from "../components/ui/toast";
import {createTrigger} from '@solid-primitives/trigger';

interface TemplateManagementProps {
    templateFetcher: (options: TableOption) => Promise<TableData<TemplateInfo[]>>;
    name?: string;
}

export default function TemplateManagement(props: TemplateManagementProps) {

    const columns: ColumnDef<TemplateInfo, any>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: (info) => <A href={`/templates/${info.row.original.id}`}
                               class="text-primary hover:underline">{info.getValue()}</A>,
        },
        {
            accessorKey: 'createdBy',
            header: 'Author',
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
        },
        {
            accessorKey: 'filledCount',
            header: 'Usage Count',
        },
        {
            id: 'actions',
            cell: (info) => (
                <div class="flex gap-2">
                    <Button as={A} href={`/templates/${info.row.original.id}`} size="sm">
                        Use Template
                    </Button>
                    <Button size="sm" onClick={() => handleDeleteTemplate(info.row.original.id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const [track, trigger] = createTrigger();
    const handleDeleteTemplate = async (templateId: number) => {
        try {
            await deleteTemplate(templateId);

            trigger();
            showToast({title: `Deleted template ${templateId}`, variant: "default"});
        } catch (error) {
            showToast({title: "Failed to delete template", variant: "destructive"});
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
                rowId="id"
            />
        </div>
    );
}