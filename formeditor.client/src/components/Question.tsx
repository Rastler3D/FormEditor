import {Card} from "./ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {QuestionConfiguration, QuestionTypes} from "../types/template";
import {Button} from "./ui/button";
import {FaSolidTrash} from "solid-icons/fa";
import {TextField, TextFieldInput, TextFieldTextArea} from "./ui/text-field";
import {createSignal, For, Show} from "solid-js";
import {Switch, SwitchControl, SwitchLabel, SwitchThumb} from "./ui/switch";

interface QuestionProps {
    question: QuestionConfiguration,
    updateQuestion: <T extends keyof QuestionConfiguration>(field: T, value: QuestionConfiguration[T]) => void,
    removeQuestion: () => void,
}

const Question = (props: QuestionProps) => {
    const [option, setOption] = createSignal("");

    const addOption = () => {
        props.updateQuestion("options", props.question.options ? [...props.question.options!, option()] : [option()]);
        setOption("");
    }

    const removeOption = (optionIndex: number) => {
        props.updateQuestion("options", props.question.options ? [...props.question.options].splice(optionIndex, 1) : []);
        setOption("");
    }

    const updateQuestionType = (type: QuestionTypes) => {
        if (type === QuestionTypes.Select) {
            props.updateQuestion("options", [])
        } else {
            props.updateQuestion("options", undefined)
        }
        props.updateQuestion("type", QuestionTypes.Select)
    };

    return (
        <Card class="mb-4 bg-accent transition-all duration-200 hover:shadow-md">
            <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                    <Select
                        required
                        value={props.question.type}
                        options={Object.values(QuestionTypes)}
                        onChange={(value) => updateQuestionType(value ?? QuestionTypes.Select)}
                        itemComponent={(props) => (
                            <SelectItem item={props.item} class="px-3 py-2 hover:bg-accent cursor-pointer">
                                {props.item.rawValue}
                            </SelectItem>
                        )}
                    >
                        <SelectTrigger
                            class="w-[180px] bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring">
                            <SelectValue>{props.question.type}</SelectValue>
                        </SelectTrigger>
                        <SelectContent class="bg-popover border border-border rounded-md shadow-md"/>
                    </Select>
                    <Button onClick={() => props.removeQuestion()} variant="outline" size="icon"
                            class="focus:outline-none focus:ring rounded-full p-1">
                        <FaSolidTrash/>
                    </Button>
                </div>
                <TextField required value={props.question.title} onChange={(value) => props.updateQuestion("title", value)}>
                    <TextFieldInput
                        type="text"
                        placeholder="Question title"
                        class="mb-2 w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                    />
                </TextField>
                <TextField required value={props.question.description}
                           onChange={(value) => props.updateQuestion("description", value)}>
                    <TextFieldTextArea
                        placeholder="Question description"
                        class="mb-2 w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                    />
                </TextField>
                <Show when={props.question.type === QuestionTypes.Select}>
                    <div class="mt-4">
                        <h4 class="text-sm font-medium mb-2">Options</h4>
                        <For each={props.question.options}>
                            {(option, index) => (
                                <div class="flex items-center mb-2">
                                    <span class="flex-grow">{option}</span>
                                    <Button
                                        onClick={() => removeOption(index())}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </For>
                        <div class="flex items-center mt-2">
                            <TextField class="flex-grow mr-2" value={option()} onChange={(value) => setOption(value)}>
                                <TextFieldInput
                                    type="text"
                                    placeholder="New option"
                                />
                            </TextField>
                            <Button onClick={() => addOption()}>
                                Add Option
                            </Button>
                        </div>
                    </div>
                </Show>
                <div class="flex items-center">
                    <Switch
                        checked={props.question.displayInTable}
                        onChange={(checked) => props.updateQuestion("displayInTable", checked)}
                        class="mr-2 flex items-center space-x-2"
                    >
                        <SwitchControl>
                            <SwitchThumb/>
                        </SwitchControl>
                        <SwitchLabel>Display in table</SwitchLabel>
                    </Switch>
                </div>
            </div>
        </Card>
    )
}

export default Question