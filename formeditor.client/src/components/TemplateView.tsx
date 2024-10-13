import {For, Match, Switch} from 'solid-js';
import {Card} from "~/components/ui/card";
import {Answer,  QuestionTypes, Template} from '~/types/template';
import {TextField, TextFieldInput,  TextFieldTextArea} from "~/components/ui/text-field";
import {createStore, SetStoreFunction, Store} from "solid-js/store";
import {Checkbox} from "~/components/ui/checkbox";
import {
    NumberField, NumberFieldDecrementTrigger,
    NumberFieldGroup,
    NumberFieldIncrementTrigger,
    NumberFieldInput
} from "~/components/ui/number-field";
import {Label} from "~/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select.tsx";

interface TemplateViewProps {
    template: Template;
    answers: Store<Record<number, Answer>>;
    setAnswers: SetStoreFunction<Record<number, Answer>>;
    isReadonly: boolean;
}

export default function TemplateView(props: TemplateViewProps) {

    return (
        <Card class="shadow-lg rounded-lg overflow-hidden">
            <div class="relative h-32 bg-muted">
                <img
                    src={props.template.image || '/placeholder.svg?height=128&width=256'}
                    alt={props.template.name}
                    class="w-full h-full object-cover"
                />
                <div class="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2">
                    <h3 class="text-sm font-medium truncate">{props.template.name}</h3>
                    <p class="text-xs text-muted-foreground truncate">{props.template.description}</p>
                </div>
            </div>
            <div class="space-y-2 p-2">
                <For each={props.template.questions}>
                    {(question) => (
                        <div class="border-b pb-2 last:border-b-0">
                            <h3 class="text-lg font-semibold mb-2">{question.title}</h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">{question.description}</p>
                            <div>
                                <Label class="block text-sm font-medium mb-1"
                                       for={`question-${question.id}`}>{question.title}</Label>
                                <p class="text-sm text-muted-foreground mb-2">{question.description}</p>
                                <Switch>
                                    <Match when={question.type === QuestionTypes.SingleLine}>
                                        <TextField
                                            readOnly={props.isReadonly}
                                            required
                                            value={props.answers[question.id].stringValue}
                                            onChange={(value) => props.setAnswers(question.id, {stringValue: value})}
                                        >
                                            <TextFieldInput type="text" id={`question-${question.id}`}
                                                            class="w-full p-2 bg-background border border-input rounded-md"/>
                                        </TextField>
                                    </Match>
                                    <Match when={question.type === QuestionTypes.MultiLine}>
                                        <TextField
                                            readOnly={props.isReadonly}
                                            required
                                            value={props.answers[question.id].stringValue}
                                            onChange={(value) => props.setAnswers(question.id, {stringValue: value})}
                                        >
                                            <TextFieldTextArea id={`question-${question.id}`}
                                                               class="w-full p-2 bg-background border border-input rounded-md"/>
                                        </TextField>
                                    </Match>
                                    <Match when={question.type === QuestionTypes.Integer}>
                                        <NumberField
                                            readOnly={props.isReadonly}
                                            required
                                            onRawValueChange={(value) => props.setAnswers(question.id, {numericValue: value})}
                                            rawValue={props.answers[question.id].numericValue}
                                            class="w-full p-2 bg-background border border-input rounded-md"
                                        >
                                            <NumberFieldGroup>
                                                <NumberFieldInput id={`question-${question.id}`}/>
                                                <NumberFieldIncrementTrigger/>
                                                <NumberFieldDecrementTrigger/>
                                            </NumberFieldGroup>
                                        </NumberField>
                                    </Match>
                                    <Match when={question.type === QuestionTypes.Integer}>
                                        <Checkbox
                                            readOnly={props.isReadonly}
                                            id={`question-${question.id}`}
                                            checked={props.answers[question.id].booleanValue}
                                            onChange={(value) => props.setAnswers(question.id, {booleanValue: value})}
                                            required
                                            class="w-full p-2 bg-background border border-input rounded-md"
                                        />
                                    </Match>
                                    <Match when={question.type === QuestionTypes.Select}>
                                        <Select
                                            readOnly={props.isReadonly}
                                            value={props.answers[question.id].stringValue}
                                            onChange={(value) => props.setAnswers(question.id, {stringValue: value!})}
                                            options={question.options!}
                                            placeholder="Select a variant"
                                            required
                                            itemComponent={(props) => <SelectItem
                                                item={props.item}>{props.item.rawValue}</SelectItem>}
                                        >
                                            <SelectTrigger aria-label="Select question" class="w-[180px]">
                                                <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent/>
                                        </Select>
                                    </Match>
                                </Switch>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </Card>
    );
}