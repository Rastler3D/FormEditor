import { For } from 'solid-js';
import { DragDropProvider, DragDropSensors, SortableProvider, DragEvent } from '@thisbeyond/solid-dnd';
import { FaSolidPlus, } from 'solid-icons/fa';
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import SortableItem from '~/components/SortableItem';
import {QuestionConfiguration, QuestionTypes} from '~/types/template';
import Question from './Question';

interface QuestionEditorProps {
    questions: QuestionConfiguration[];
    updateQuestion:  <T extends keyof QuestionConfiguration>(index: number, field: T, value: QuestionConfiguration[T]) => void,
    changeQuestions: (questions: QuestionConfiguration[]) => void,
}

export default function QuestionEditor(props: QuestionEditorProps) {
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
        props.changeQuestions(props.questions.filter(q => q.id !== id));
    };

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <div class="p-6 space-y-4">
                <DragDropProvider onDragEnd={onDragEnd}>
                    <DragDropSensors>
                        <SortableProvider ids={props.questions.map((_,index) => index)}>
                            <For each={props.questions}>
                                {(question, index) => (
                                    <SortableItem id={index()}>
                                        <Question 
                                            question={question} 
                                            updateQuestion={(field, value) => updateQuestion(index(), field, value)} 
                                            removeQuestion={() => removeQuestion(index())} />
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