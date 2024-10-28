import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card.tsx";
import { Form, QuestionTypes, Template } from "~/types/types.ts";
import DataTable from "./DataTable";
import { deleteForm, getSubmittedForms } from "../services/formService.ts";
import { useNavigate } from "@solidjs/router";
import { ColumnDef } from "@tanstack/solid-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu.tsx";
import { Clock, Eye, MoreHorizontal, Trash, User } from "lucide-solid";
import { Button } from "~/components/ui/button.tsx";
import { Badge } from "~/components/ui/badge.tsx";
import { showToast } from "~/components/ui/toast.tsx";
import { createTrigger } from "@solid-primitives/trigger";
import { useLanguage } from "~/contexts/LanguageContext";

interface TemplateSubmissionsProps {
    template: Template;
}

const TemplateSubmissions = (props: TemplateSubmissionsProps) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [track, trigger] = createTrigger();

    const defaultColumns: ColumnDef<Form, any>[] = [
        {
            accessorKey: 'submittedBy',
            header: t('UserName'),
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <User class="h-4 w-4 text-muted-foreground"/>
                    <span>{info.getValue()}</span>
                </div>
            )
        },
        {
            accessorKey: 'fillingDate',
            header: t('FillingDate'),
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <Clock class="h-4 w-4 text-muted-foreground"/>
                    <span>{new Date(info.getValue() as string).toLocaleString()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'submittedAt',
            header: t('SubmittedAt'),
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <Clock class="h-4 w-4 text-muted-foreground"/>
                    <span>{new Date(info.getValue() as string).toLocaleString()}</span>
                </div>
            ),
        },
    ];

    const actionColumn: ColumnDef<Form, any> = {
        header: t('Actions'),
        id: 'actions',
        cell: (info) => (
            <DropdownMenu>
                <DropdownMenuTrigger as={Button} variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4"/>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => navigate(`/forms/${info.row.original.id}`)}>
                        <Eye class="mr-2 h-4 w-4"/>
                        {t('View')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDeleteForm(info.row.original.id)}>
                        <Trash class="mr-2 h-4 w-4"/>
                        {t('Delete')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    };

    const columns: ColumnDef<Form, any>[] = [
        ...defaultColumns,
        ...props.template.questions
            .filter(q => q.displayInTable)
            .map(q => ({
                accessorKey: `answers.${q.id}`,
                header: q.title,
                enableSorting: false,
                cell: (info) => {
                    if (!info.getValue()) {
                        return (<Badge variant="warning">-</Badge>);
                    } else if (q.type == QuestionTypes.Integer) {
                        return (<Badge variant="default">{info.getValue().numericValue}</Badge>)
                    } else if (q.type == QuestionTypes.Checkbox) {
                        return (
                            <Badge variant={info.getValue().booleanValue ? "success" : "secondary"}>
                                {info.getValue().booleanValue ? t('Yes') : t('No')}
                            </Badge>
                        );
                    } else {
                        return (<Badge> {info.getValue().stringValue}</Badge>);
                    }
                },
            })),
        actionColumn
    ];

    const handleDeleteForm = async (formId: number) => {
        try {
            await deleteForm(formId);
            trigger();
            showToast({title: t('DeletedForm', { formId }), variant: "success"});
        } catch (error) {
            showToast({title: t('FailedToDeleteForm'), variant: "destructive"});
        }
    };

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <CardHeader>
                <CardTitle class="text-2xl font-bold">{t('SubmittedApplications')}</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable<Form>
                    columns={columns}
                    refetchTrigger={track}
                    fetchData={(opt) => getSubmittedForms(props.template.id, opt)}
                    onRowClick={(form) => navigate(`/forms/${form.id}`)}
                    rowId="id"
                />
            </CardContent>
        </Card>
    );
};

export default TemplateSubmissions;
