import {TemplateInfo} from "../types/template";
import {For} from "solid-js";
import TemplateCard, {TemplateSkeleton} from "./TemplateCard";

const templateColumns = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => <A href={`/template/${info.row.original.id}`} class="text-primary hover:underline">{info.getValue()}</A>,
    },
    { accessorKey: 'createdBy', header: t('createdBy') },
    { accessorKey: 'usageCount', header: t('usageCount') },
];

type TemplateTableProps = {
    templates?: TemplateInfo[],
    isLoading: boolean;
}

const TemplateTable = (props: TemplateTableProps) => {
    return (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {props.isLoading ? (
                <For each={Array(8).fill(null)}>
                    {() => <TemplateSkeleton/>}
                </For>
            ) : (
                <For each={props.templates}>
                    {(template) => <TemplateCard template={template}/>}
                </For>
            )}
        </div>
    );
};

export default TemplateTable;
