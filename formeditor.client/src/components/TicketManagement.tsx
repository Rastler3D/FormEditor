import {ColumnDef} from "@tanstack/solid-table";
import DataTable from '~/components/DataTable';
import {Button} from '~/components/ui/button';
import {TableData, TableOption, Ticket} from '~/types/types';
import {getTickets} from '~/services/jiraService';
import {Clock, ExternalLink, FileText, MoreHorizontal} from "lucide-solid";
import {Badge} from "~/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {useLanguage} from "~/contexts/LanguageContext";
import {useAuth} from "~/contexts/AuthContext";

export default function TicketManagement() {
    const {t} = useLanguage();
    const {user} = useAuth();

    const columns: ColumnDef<Ticket, any>[] = [
        {
            accessorKey: 'key',
            header: t('TicketKey'),
            cell: (info) => (
                <div onClick={() => window.open(info.row.original.url, '_blank')}
                     class="text-primary hover:underline flex items-center space-x-2">
                    <FileText class="h-4 w-4 text-muted-foreground"/>
                    <span>{info.getValue()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'summary',
            header: t('Summary'),
        },
        {
            accessorKey: 'status',
            header: t('Status'),
            cell: (info) => (
                <Badge variant="default">
                    {info.getValue()}
                </Badge>
            ),
        },
        {
            accessorKey: 'priority',
            header: t('Priority'),
            cell: (info) => (
                <Badge
                    variant={info.getValue() === 'High' ? 'destructive' : info.getValue() === 'Average' ? 'warning' : 'success'}>
                    {info.getValue()}
                </Badge>
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
            id: 'actions',
            enableSorting: false,
            header: t('Actions'),
            cell: (info) => (
                <DropdownMenu>
                    <DropdownMenuTrigger as={Button} variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem class="cursor-pointer"
                                          onSelect={() => window.open(info.row.original.url, '_blank')}>
                            <ExternalLink class="mr-2 h-4 w-4"/>
                            {t('OpenInJira')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const fetchTicketData = async (options: TableOption): Promise<TableData<Ticket[]>> => {
        if (!user()) {
            return {data: [], totalRows: 0};
        }
        return getTickets(user()!.id, options);
    };

    return (
        <Card class="bg-background">
            <CardHeader>
                <CardTitle>{t('YourTickets')}</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    fetchData={fetchTicketData}
                    isSelectable={false}
                    rowId="key"
                />
            </CardContent>
        </Card>
    );
}