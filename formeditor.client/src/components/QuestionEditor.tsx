import { createSignal, For, Show} from 'solid-js';
import {
    DragDropProvider,
    DragDropSensors,
    SortableProvider,
    DragEvent,
    DragOverlay,
    closestCenter
} from '@thisbeyond/solid-dnd';
import {Button} from "~/components/ui/button";
import {Card, CardContent, CardHeader} from "~/components/ui/card";
import SortableItem from '~/components/SortableItem';
import {QuestionConfiguration, QuestionTypes} from '~/types/template';
import Question from './Question';
import {Plus} from 'lucide-solid';

interface QuestionEditorProps {
    questions: QuestionConfiguration[];
    updateQuestion: <T extends keyof QuestionConfiguration>(index: number, field: T, value: QuestionConfiguration[T]) => void,
    changeQuestions: (questions: QuestionConfiguration[]) => void,
}

export default function QuestionEditor(props: QuestionEditorProps) {
    const [activeItem, setActiveItem] = createSignal<number>();
    const onDragStart = ({draggable}: DragEvent) => setActiveItem(+draggable.id);
    const onDragEnd = ({draggable, droppable}: DragEvent) => {
        if (draggable && droppable) {
            const fromIndex = +draggable.id;
            const toIndex = +droppable.id;
            if (fromIndex !== toIndex) {
                const updatedQuestions = [...props.questions];
                [updatedQuestions[fromIndex], updatedQuestions[toIndex]] = [updatedQuestions[toIndex], updatedQuestions[fromIndex]];
                props.changeQuestions(updatedQuestions);
            }
        }
    };

    const addQuestion = () => {
        const newQuestion: QuestionConfiguration = {
            type: QuestionTypes.SingleLine,
            title: 'New Question',
            description: 'Enter question description',
            displayInTable: false,
        };
        props.changeQuestions([...props.questions, newQuestion]);
    };

    const updateQuestion = <T extends keyof QuestionConfiguration>(id: number, field: T, value: QuestionConfiguration[T]) => {
        props.updateQuestion(id, field, value);
    };

    const removeQuestion = (id: number) => {
        props.changeQuestions(props.questions.filter((_, index) => index !== id));
    };

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <div class="space-y-6">
                <CardHeader>
                    <h2 class="text-2xl font-bold">Question Editor</h2>
                </CardHeader>
                <CardContent>
                    <DragDropProvider onDragEnd={onDragEnd} onDragStart={onDragStart} collisionDetector={closestCenter}>
                        <DragDropSensors></DragDropSensors>
                        <div class="space-y-4 column self-stretch">
                            <SortableProvider ids={props.questions.map((_, index) => index)}>
                                <For each={props.questions.map((item, sortIndex) => ({item, sortIndex}))}>
                                    {({item, sortIndex}, index) => (
                                        <SortableItem id={sortIndex}>
                                            {(sortListener) => (
                                                <Question
                                                    sortListener={sortListener}
                                                    updateQuestion={(field, value) => updateQuestion(index(), field, value)}
                                                    removeQuestion={() => removeQuestion(index())}
                                                    question={item}
                                                />
                                            )}

                                        </SortableItem>
                                    )}
                                </For>
                            </SortableProvider>
                        </div>
                        <DragOverlay>
                            <Show when={props.questions?.[activeItem()!]}>
                                <Question
                                    question={props.questions[activeItem()!]}
                                    updateQuestion={(field, value) => updateQuestion(activeItem()!, field, value)}
                                    removeQuestion={() => removeQuestion(activeItem()!)}
                                />
                            </Show>
                        </DragOverlay>
                    </DragDropProvider>
                    <Button onClick={addQuestion}
                            class="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus class="w-4 h-4 mr-2"/>
                        Add Question
                    </Button>
                </CardContent>
            </div>
        </Card>
    );
}