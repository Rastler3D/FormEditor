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
import {fetchFilledForms, submitForm, addComment, toggleLike} from '~/services/api';
import {useAuth} from '~/contexts/AuthContext';
import TemplateSettings from "~/components/TemplateSettings";
import {Template} from "~/types/template.ts";
import FormSubmission from "~/components/FormSubmission.tsx";
import TemplateSubmissions from "~/components/TemplateSubmissions.tsx";
import FormAggregation from "~/components/FormAggregation.tsx";

interface TemplateManagerProps {
    template: Template;
}

const TemplateManager = (props: TemplateManagerProps) => {
    const [activeTab, setActiveTab] = createSignal('form');
    const [formData, setFormData] = createSignal({});
    const [globalFilter, setGlobalFilter] = createSignal('');
    const [newComment, setNewComment] = createSignal('');
    const {user} = useAuth();

    

    const table = createSolidTable({
        get data() {
            return filledForms() || [];
        },
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
        state: {
            get globalFilter() {
                return globalFilter();
            },
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    const handleInputChange = (questionId, value) => {
        setFormData(prev => ({...prev, [questionId]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitForm(formData());
        // You might want to show a success message or redirect the user here
    };

    const handleAddComment = async () => {
        if (newComment().trim()) {
            await addComment(template().id, newComment());
            setNewComment('');
            // In a real app, you'd update the template data here with the new comment
        }
    };

    const handleToggleLike = async () => {
        const newLikeCount = await toggleLike(template().id);
        // In a real app, you'd update the template data here with the new like count
    };

    return (
        <div class="container mx-auto p-4">
            <Tabs value={activeTab()} onChange={setActiveTab}>
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
                    <FormSubmission template={props.template} />
                </TabsContent>
                <TabsContent value="answers">
                    <TemplateSubmissions template={props.template} />
                </TabsContent>
                <TabsContent value="configuration">
                    <TemplateSettings template={props.template} />
                </TabsContent>
                <TabsContent value="aggregation">
                    <FormAggregation template={props.template} />
                </TabsContent>
            </Tabs>

            <div class="p-6 border-t border-border">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Engagement</h2>
                    <Button onClick={handleToggleLike} variant="outline"
                            class="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center">
                        <FaSolidHeart class="mr-2"/>
                        <span>{template().likes} Likes</span>
                    </Button>
                </div>

                <div class="mt-8">
                    <h3 class="text-xl font-semibold mb-4">Comments</h3>
                    <div class="space-y-4 max-h-60 overflow-y-auto">
                        <For each={template().comments}>
                            {(comment) => (
                                <Card class="bg-accent">
                                    <div class="p-4">
                                        <p class="mb-2">{comment.text}</p>
                                        <div class="text-sm text-muted-foreground flex justify-between">
                                            <span>{comment.author}</span>
                                            <span>{new Date(comment.date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </For>
                    </div>
                    <div class="mt-4">
                        <TextField>
                            <TextFieldInput
                                type="text"
                                value={newComment()}
                                onInput={(e) => setNewComment(e.currentTarget.value)}
                                placeholder="Add a comment..."
                                class="mb-2 w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                            />
                        </TextField>
                        <Button onClick={handleAddComment}
                                class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center">
                            <FaSolidComment class="mr-2"/>
                            <span>Add Comment</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateManager;