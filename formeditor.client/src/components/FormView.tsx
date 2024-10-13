import {Answer, Question, QuestionTypes} from "~/types/template.ts";
import {Card} from "~/components/ui/card.tsx";
import {For, Show} from "solid-js";

interface FormViewProps {
    questions: Question[];
    answers: Record<number, Answer>;
    isReadOnly: boolean;
}

export default function FormView(props: FormViewProps) {
    return (
        <Card class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div class="space-y-6">
                <For each={props.questions}>
                    {(question) => (
                        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                            <h3 class="text-lg font-semibold mb-2">{question.title}</h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">{question.description}</p>
                            <Show when={question.type === QuestionTypes.SingleLine || question.type === QuestionTypes.Integer}>
                                <input type="text" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" placeholder="Your answer" />
                            </Show>
                            <Show when={question.type === QuestionTypes.SingleLine || question.type === QuestionTypes.Integer}>
                                <input type="text" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" placeholder="Your answer" />
                            </Show>
                            <Show when={question.type === QuestionTypes.MultiLine}>
                                <textarea class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Your answer"></textarea>
                            </Show>
                            <Show when={question.type === QuestionTypes.Checkbox}>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox"   class="form-checkbox h-5 w-5 text-blue-600" />
                                    <span>Yes</span>
                                </label>
                            </Show>
                        </div>
                    )}
                </For>
            </div>
        </Card>
    );
}