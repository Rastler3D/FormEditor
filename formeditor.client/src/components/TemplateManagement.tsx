import {ColumnDef} from "@tanstack/solid-table";
import {A, useNavigate} from '@solidjs/router';
import DataTable from '~/components/DataTable';
import {Button} from '~/components/ui/button';
import {TableData, TableOption, TemplateInfo} from '~/types/types.ts';
import {deleteTemplate} from '~/services/templateService.ts';
import {showToast} from "../components/ui/toast";
import {createTrigger} from '@solid-primitives/trigger';
import {Clock, Eye, FileText, MoreHorizontal, Trash, User} from "lucide-solid";
import {Badge} from "~/components/ui/badge.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import {useLanguage} from "~/contexts/LanguageContext.tsx";

interface TemplateManagementProps {
    templateFetcher: (options: TableOption) => Promise<TableData<TemplateInfo[]>>;
    name?: string;
}

export default function TemplateManagement(props: TemplateManagementProps) {
    const [track, trigger] = createTrigger();
    const navigate = useNavigate();
    const {t} = useLanguage();

    const columns: ColumnDef<TemplateInfo, any>[] = [
        {
            accessorKey: 'name',
            header: t('Name'),
            cell: (info) => (
                <A href={`/templates/${info.row.original.id}`}
                   class="text-primary hover:underline flex items-center space-x-2">
                    <FileText class="h-4 w-4"/>
                    <span>{info.getValue()}</span>
                </A>
            ),
        },
        {
            accessorKey: 'createdBy',
            header: t('Author'),
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <User class="h-4 w-4 text-muted-foreground"/>
                    <span>{info.getValue()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: t('CreatedAt'),
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <Clock class="h-4 w-4 text-muted-foreground"/>
                    <span>{new Date(info.getValue() as string).toLocaleString()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'topic',
            header: t('Topic'),
            cell: (info) => (
                <Badge variant="default">
                    {info.getValue()}
                </Badge>
            ),
        },
        {
            accessorKey: 'filledCount',
            header: t('FillsCount'),
            cell: (info) => (
                <Badge variant="secondary">
                    {info.getValue()} fills
                </Badge>
            ),
        },
        {
            id: 'actions',
            enableSorting: false,
            header: t('Actions'),
            cell: (info) => (
                <DropdownMenu>
                    <DropdownMenuTrigger as={Button} variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem class="cursor-pointer" onSelect={() => navigate(`/templates/${info.row.original.id}`)}>
                            <Eye class="mr-2 h-4 w-4"/>
                            {t('UseTemplate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem class="cursor-pointer" onSelect={() => handleDeleteTemplate(info.row.original.id)}>
                            <Trash class="mr-2 h-4 w-4"/>
                            {t('Delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleDeleteTemplate = async (templateId: number) => {
        try {
            await deleteTemplate(templateId);
            trigger();
            showToast({title: `Deleted template ${templateId}`, variant: "success"});
        } catch (error) {
            showToast({title: "Failed to delete template", variant: "destructive"});
        }
    };

    return (
        <Card class="bg-background">
            <CardHeader>
                <CardTitle>{props.name ?? "Templates"}</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    fetchData={props.templateFetcher}
                    isSelectable={false}
                    refetchTrigger={track}
                    rowId="id"
                />
            </CardContent>
        </Card>
    );
}