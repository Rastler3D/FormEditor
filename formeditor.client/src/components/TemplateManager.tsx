import {createSignal, createResource, For, Show} from 'solid-js';
import {Tabs, TabsList, TabsTrigger, TabsContent} from "~/components/ui/tabs";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import {Button} from "~/components/ui/button";
import {Card} from "~/components/ui/card";
import {TextField, TextFieldInput, TextFieldTextArea} from "~/components/ui/text-field";
import {A,} from '@solidjs/router';
import {ArrowUpDown, ArrowUp, ArrowDown, Search} from 'lucide-solid';
import {
    createSolidTable,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
} from "@tanstack/solid-table";
import {
    Pagination,
    PaginationEllipsis,
    PaginationItem,
    PaginationItems,
    PaginationNext,
    PaginationPrevious
} from './ui/pagination';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {FaSolidComment, FaSolidHeart} from 'solid-icons/fa';
import {fetchFilledForms, submitForm, addComment, toggleLike} from '~/services/templateService.ts';
import {useAuth} from '~/contexts/AuthContext';
import TemplateSettings from "~/components/TemplateSettings";
import {Template, TemplateConfiguration} from "~/types/template.ts";
import TemplateSubmission from "~/components/TemplateSubmission.tsx";
import TemplateSubmissions from "~/components/TemplateSubmissions.tsx";
import FormAggregation from "~/components/FormAggregation.tsx";
import Likes from "~/components/Likes.tsx";
import Comments from "~/components/Comments.tsx";

interface TemplateManagerProps {
    template: Template;
    isSavingChanges: boolean;
    onSavedChanges: (template: TemplateConfiguration) => void;
}

const TemplateManager = (props: TemplateManagerProps) => {
    return (
        <div class="container mx-auto p-4">
            <Tabs defaultValue="form" disabled={props.isSavingChanges}>
                <TabsList class="flex space-x-2 mb-4">
                    <TabsTrigger value="form"
                                 class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        Form
                    </TabsTrigger>
                    <TabsTrigger value="answers"
                                 class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        Answers
                    </TabsTrigger>
                    <TabsTrigger value="configuration"
                                 class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        Configuration
                    </TabsTrigger>
                    <TabsTrigger value="aggregation"
                                 class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                        Aggregation
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="form">
                    <TemplateSubmission template={props.template} />
                </TabsContent>
                <TabsContent value="answers">
                    <TemplateSubmissions template={props.template} />
                </TabsContent>
                <TabsContent value="configuration">
                    <TemplateSettings template={props.template} isSavingChanges={props.isSavingChanges} onSaveChanges={props.onSavedChanges} />
                </TabsContent>
                <TabsContent value="aggregation">
                    <FormAggregation template={props.template} />
                </TabsContent>
            </Tabs>

            <div class="p-6 border-t border-border">
                <Likes template={props.template}></Likes>
                <Comments template={props.template}></Comments>
            </div>
        </div>
    );
};

export default TemplateManager;