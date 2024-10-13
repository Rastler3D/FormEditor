import { For } from 'solid-js';
import { DragDropProvider, DragDropSensors, SortableProvider } from '@thisbeyond/solid-dnd';
import { FaSolidPlus, FaSolidTrash } from 'solid-icons/fa';
import { Button } from "~/components/ui/button";
import { TextField, TextFieldInput, TextFieldTextArea } from "~/components/ui/text-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch, SwitchControl, SwitchLabel, SwitchThumb } from "~/components/ui/switch";
import { Card } from "~/components/ui/card";
import SortableItem from '~/components/SortableItem';
import { Question, QuestionTypes } from '~/types/template';

interface QuestionEditorProps {
    questions: Question[];
    onQuestionsChange: (questions: Question[]) => void;
}

export default function QuestionEditor(props: QuestionEditorProps) {
    const onDragEnd = ({draggable, droppable}) => {
        if (draggable && droppable) {
            const currentItems = props.questions;
            const fromIndex = currentItems.findIndex((item) => item.id === draggable.id);
            const toIndex = currentItems.findIndex((item) => item.id === droppable.id);
            if (fromIndex !== toIndex) {
                const updatedItems = currentItems.slice();
                updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
                props.onQuestionsChange(updatedItems);
            }
        }
    };

    const addOption = (questionId: number) => {
        if (newOption().trim()) {
            updateQuestion(questionId, 'options', [...(props.questions.find(q => q.id === questionId)?.options || []), newOption().trim()]);
            setNewOption('');
        }
    };

    const removeOption = (questionId: number, optionToRemove: string) => {
        const question = props.questions.find(q => q.id === questionId);
        if (question && question.options) {
            updateQuestion(questionId, 'options', question.options.filter(option => option !== optionToRemove));
        }
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: props.questions.length + 1,
            type: QuestionTypes.SingleLine,
            title: 'New Question',
            description: 'Enter question description',
            displayInTable: false,
        };
        props.onQuestionsChange([...props.questions, newQuestion]);
    };

    const updateQuestion = (id: number, field: keyof Question, value: any) => {
        props.onQuestionsChange(
            props.questions.map(q => q.id === id ? {...q, [field]: value} : q)
        );
    };

    const removeQuestion = (id: number) => {
        props.onQuestionsChange(props.questions.filter(q => q.id !== id));
    };

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <div class="p-6 space-y-4">
                <DragDropProvider onDragEnd={onDragEnd}>
                    <DragDropSensors>
                        <SortableProvider ids={props.questions.map((q) => q.id)}>
                            <For each={props.questions}>
                                {(question) => (
                                    <SortableItem id={question.id}>
                                        <Card class="mb-4 bg-accent transition-all duration-200 hover:shadow-md">
                                            <div class="p-4">
                                                <div class="flex items-center justify-between mb-4">
                                                    <Select
                                                        value={question.type}
                                                        options={Object.values(QuestionTypes)}
                                                        onChange={(value) => updateQuestion(question.id, 'type', value)}
                                                        itemComponent={(props) => (
                                                            <SelectItem item={props.item} class="px-3 py-2 hover:bg-accent cursor-pointer">
                                                                {props.item.rawValue}
                                                            </SelectItem>
                                                        )}
                                                    >
                                                        <SelectTrigger class="w-[180px] bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring">
                                                            <SelectValue>{question.type}</SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent class="bg-popover border border-border rounded-md shadow-md" />
                                                    </Select>
                                                    <Button onClick={() => removeQuestion(question.id)} variant="outline" size="icon" class="focus:outline-none focus:ring rounded-full p-1">
                                                        <FaSolidTrash />
                                                    </Button>
                                                </div>
                                                <TextField>
                                                    <TextFieldInput
                                                        type="text"
                                                        value={question.title}
                                                        onInput={(e) => updateQuestion(question.id, 'title', e.currentTarget.value)}
                                                        placeholder="Question title"
                                                        class="mb-2 w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                                                    />
                                                </TextField>
                                                <TextField>
                                                    <TextFieldTextArea
                                                        value={question.description}
                                                        onInput={(e) => updateQuestion(question.id, 'description', e.currentTarget.value)}
                                                        placeholder="Question description"
                                                        class="mb-2 w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                                                    />
                                                </TextField>
                                                {question.type === QuestionTypes.Select && (
                                                    <div class="mt-4">
                                                        <h4 class="text-sm font-medium mb-2">Options</h4>
                                                        <For each={question.options}>
                                                            {(option) => (
                                                                <div class="flex items-center mb-2">
                                                                    <span class="flex-grow">{option}</span>
                                                                    <Button
                                                                        onClick={() => removeOption(question.id, option)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </For>
                                                        <div class="flex items-center mt-2">
                                                            <TextField class="flex-grow mr-2">
                                                                <TextFieldInput
                                                                    type="text"
                                                                    value={newOption()}
                                                                    onInput={(e) => setNewOption(e.currentTarget.value)}
                                                                    placeholder="New option"
                                                                />
                                                            </TextField>
                                                            <Button onClick={() => addOption(question.id)}>
                                                                Add Option
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div class="flex items-center">
                                                    <Switch
                                                        checked={question.displayInTable}
                                                        onChange={(checked) => updateQuestion(question.id, 'displayInTable', checked)}
                                                        class="mr-2 flex items-center space-x-2"
                                                    >
                                                        <SwitchControl>
                                                            <SwitchThumb />
                                                        </SwitchControl>
                                                        <SwitchLabel>Display  in table</SwitchLabel>
                                                    </Switch>
                                                </div>
                                            </div>
                                        </Card>
                                    </SortableItem>
                                )}
                            </For>
                        </SortableProvider>
                    </DragDropSensors>
                </DragDropProvider>
                <Button onClick={addQuestion} class="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    <FaSolidPlus class="inline-block mr-2" />
                    Add Question
                </Button>
            </div>
        </Card>
    );
}