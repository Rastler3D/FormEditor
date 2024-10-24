import {Card} from "./ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {QuestionConfiguration, QuestionTypes, QuestionOptions} from "../types/template";
import {Button} from "./ui/button";
import {TextField, TextFieldInput, TextFieldTextArea} from "./ui/text-field";
import {createSignal, For, Show, createEffect} from "solid-js";
import {Switch, SwitchControl, SwitchLabel, SwitchThumb} from "./ui/switch";
import {GripVertical, Trash, X, Plus} from "lucide-solid";
import {Listener} from "@thisbeyond/solid-dnd"

interface QuestionProps {
    question: QuestionConfiguration;
    updateQuestion: <T extends keyof QuestionConfiguration>(field: T, value: QuestionConfiguration[T]) => void;
    removeQuestion: () => void;
    sortListener?: Listener
}

const Question = (props: QuestionProps) => {
    const [option, setOption] = createSignal("");
    const addOption = () => {
        if (option().trim()) {
            props.question.options.co
            props.updateQuestion("options", [...(props.question.options || []), option().trim()]);
            setOption("");
        }
    };

    const removeOption = (optionIndex: number) => {
        props.updateQuestion("options", (props.question.options || []).filter((_, index) => index !== optionIndex));
    };

    const updateQuestionType = (type: QuestionTypes) => {
        props.updateQuestion("type", type);
        if (type === QuestionTypes.Select) {
            props.updateQuestion("options", props.question.options || []);
        } else {
            props.updateQuestion("options", undefined);
        }
    };

    return (
        <div
            class="flex items-center pl-2 space-x-2 bg-background rounded-lg border mb-2 transition-all duration-200 hover:dark:shadow-md hover:shadow-md">
            <div
                class="cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 touch-none"
                {...(props.sortListener ?? {})}
            >
                <GripVertical size={20}/>
            </div>

            <div class="flex-grow"><Card
                class="bg-muted border-none shadow-none rounded-l-none transition-all duration-200">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <Select
                            required
                            value={props.question.type}
                            options={Object.values(QuestionTypes)}
                            onChange={(value) => updateQuestionType(value ?? QuestionTypes.SingleLine)}
                            itemComponent={(props) => (
                                <SelectItem item={props.item} class="px-3 py-2 hover:bg-accent cursor-pointer">
                                    {QuestionOptions[props.item.rawValue]}
                                </SelectItem>
                            )}
                        >
                            <SelectTrigger
                                class="w-full sm:w-[180px] bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring">
                                <SelectValue>{QuestionOptions[props.question.type]}</SelectValue>
                            </SelectTrigger>
                            <SelectContent class="bg-popover border border-border rounded-md shadow-md"/>
                        </Select>
                        <Button
                            onClick={() => props.removeQuestion()}
                            variant="outline"
                            size="icon"
                            class="focus:outline-none focus:ring bg-background rounded-full p-1 dark:hover:bg-zinc-600 hover:bg-zinc-50"
                        >
                            <Trash size={16}/>
                        </Button>
                    </div>
                    <TextField
                        required
                        value={props.question.title}
                        onChange={(value) => props.updateQuestion("title", value)}
                    >
                        <TextFieldInput
                            type="text"
                            placeholder="Question title"
                            class="mb-2 w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                        />
                    </TextField>
                    <TextField
                        required
                        value={props.question.description}
                        onChange={(value) => props.updateQuestion("description", value)}
                    >
                        <TextFieldTextArea
                            placeholder="Question description"
                            class="mb-2 w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                        />
                    </TextField>
                    <Show when={props.question.type === QuestionTypes.Select}>
                        <div class="mt-4">
                            <h4 class="text-sm font-medium mb-2">Options</h4>
                            <div class="space-y-2">
                                <For each={props.question.options}>
                                    {(option, index) => (
                                        <div
                                            class="flex items-center justify-between p-2 py-0 bg-background rounded-md border border-input">
                                            <span class="flex-grow text-sm ml-1">{option}</span>
                                            <Button
                                                onClick={() => removeOption(index())}
                                                variant="ghost"
                                                size="sm"
                                                class="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <X size={16}/>
                                            </Button>
                                        </div>
                                    )}
                                </For>
                            </div>
                            <div class="flex items-center mt-2">
                                <TextField class="flex-grow mr-2" value={option()}
                                           onChange={(value) => setOption(value)}>
                                    <TextFieldInput
                                        class="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                                        type="text"
                                        placeholder="New option"
                                    />
                                </TextField>
                                <Button
                                    class="flex h-10 text-sm border"
                                    onClick={addOption}
                                    disabled={!option().trim() || props.question.options?.includes(option())}
                                >
                                    <Plus size={16} class="mr-1"/> Add
                                </Button>
                            </div>
                        </div>
                    </Show>
                    <div class="flex items-center mt-4">
                        <Switch
                            checked={props.question.displayInTable}
                            onChange={(checked) => props.updateQuestion("displayInTable", checked)}
                            class="mr-2 flex items-center space-x-2"
                        >
                            <SwitchControl class="dark:[&[data-checked]]:bg-primary dark:bg-zinc-600">
                                <SwitchThumb/>
                            </SwitchControl>
                            <SwitchLabel>Display in table</SwitchLabel>
                        </Switch>
                    </div>
                </div>
            </Card></div>
        </div>
    );
};

export default Question;