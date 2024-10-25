import {For, Match, Switch} from 'solid-js';
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {Answer, QuestionTypes, TemplateConfiguration} from '~/types/template';
import {TextField, TextFieldInput, TextFieldTextArea} from "~/components/ui/text-field";
import {SetStoreFunction, Store} from "solid-js/store";
import {Checkbox} from "~/components/ui/checkbox";
import {
    NumberField, NumberFieldDecrementTrigger,
    NumberFieldGroup,
    NumberFieldIncrementTrigger,
    NumberFieldInput
} from "~/components/ui/number-field";
import {Label} from "~/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select.tsx";
import {SolidMarkdown} from "solid-markdown";
import Image from "~/components/Image"


interface TemplateViewProps {
    template: TemplateConfiguration;
    answers?: Store<Record<number, Answer>>;
    fillingDate: Date;
    filledBy?: string;
    setAnswers?: SetStoreFunction<Record<number, Answer>>;
    isReadonly?: boolean;
}


export default function TemplateView(props: TemplateViewProps) {
    return (
        <Card class="rounded-lg overflow-hidden">
            <CardHeader class="relative bg-muted p-6 min-h-52">
                <Image as={"div"} class="absolute inset-0 bg-auto bg-no-repeat bg-center"
                       src={props.template.image }
                       classList={{"dark:invert": !props.template.image}}>
                    <div class="absolute inset-0  backdrop-blur-sm"></div>
                </Image>
                <div class="relative z-10">
                    <CardTitle class="text-3xl font-bold mb-2 break-all">{props.template.name}</CardTitle>
                    <div class="text-lg break-all">
                        <SolidMarkdown>{props.template.description}</SolidMarkdown>
                    </div>
                </div>
            </CardHeader>
            <CardContent class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div class="border-t pt-4 first:border-t-0 first:pt-0">
                        <Label class="text-lg font-medium mb-2" for="filling-date">Date</Label>
                        <p class="text-sm text-muted-foreground mb-2">Date the form was filled out</p>
                        <TextField id="filling-date" readOnly required disabled
                                   value={new Date(props.fillingDate).toLocaleString()}>
                            <TextFieldInput type="text" class="w-full"/>
                        </TextField>
                    </div>
                    <div class="border-t pt-4 first:border-t-0 first:pt-0">
                        <Label class="text-lg font-medium mb-2" for="filled-by">User</Label>
                        <p class="text-sm text-muted-foreground mb-2">Date the form was filled out</p>
                        <TextField id="filled-by" disabled readOnly required value={props.filledBy}>
                            <TextFieldInput type="text" class="w-full"/>
                        </TextField>
                    </div>
                </div>
                <For each={props.template.questions}>
                    {(question, index) => (
                        <div class="border-t pt-4 first:border-t-0 first:pt-0">
                            <Label class="text-lg font-medium mb-2" for={`question-${index()}`}>
                                {question.title}
                            </Label>
                            <p class="text-sm text-muted-foreground mb-2">{question.description}</p>
                            <Switch>
                                <Match when={question.type === QuestionTypes.SingleLine}>
                                    <TextField
                                        disabled={props.isReadonly}
                                        id={`question-${index()}`}
                                        readOnly={props.isReadonly}
                                        required
                                        onChange={(value) => props?.setAnswers?.(question.id!, {stringValue: value})}
                                    >
                                        <TextFieldInput value={props?.answers?.[question.id!]?.stringValue} type="text" class="w-full"/>
                                    </TextField>
                                </Match>
                                <Match when={question.type === QuestionTypes.MultiLine}>
                                    <TextField
                                        disabled={props.isReadonly}
                                        id={`question-${index()}`}
                                        readOnly={props.isReadonly}
                                        required
                                        onChange={(value) => props?.setAnswers?.(question.id!, {stringValue: value})}
                                    >
                                        <TextFieldTextArea value={props?.answers?.[question.id!]?.stringValue} class="w-full min-h-[100px]"/>
                                    </TextField>
                                </Match>
                                <Match when={question.type === QuestionTypes.Integer}>
                                    <NumberField
                                        disabled={props.isReadonly}
                                        id={`question-${index()}`}
                                        readOnly={props.isReadonly}
                                        required
                                        onRawValueChange={(value) => props?.setAnswers?.(question.id!, {numericValue: value})}
                                        rawValue={props?.answers?.[question.id!]?.numericValue}
                                        class="w-full"
                                    >
                                        <NumberFieldGroup>
                                            <NumberFieldInput/>
                                            <NumberFieldIncrementTrigger/>
                                            <NumberFieldDecrementTrigger/>
                                        </NumberFieldGroup>
                                    </NumberField>
                                </Match>
                                <Match when={question.type === QuestionTypes.Checkbox}>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id={`question-${index()}`}
                                            checked={props?.answers?.[question.id!]?.booleanValue}
                                            onChange={(checked) => props?.setAnswers?.(question.id!, {booleanValue: checked})}
                                            readOnly={props.isReadonly}
                                            disabled={props.isReadonly}
                                            class="has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 peer"
                                        />
                                        <Label for={`question-${index()}-input`}
                                               class="text-sm peer-has-[:disabled]:opacity-50">{props?.answers?.[question.id!]?.booleanValue? "Yes" : "No"}</Label>
                                    </div>
                                </Match>
                                <Match when={question.type === QuestionTypes.Select}>
                                    <Select
                                        disabled={props.isReadonly}
                                        readOnly={props.isReadonly}
                                        value={props?.answers?.[question.id!]?.stringValue}
                                        onChange={(value) => props?.setAnswers?.(question.id!, {stringValue: value!})}
                                        options={question.options ?? []}
                                        placeholder="Select an option"
                                        itemComponent={(props) => <SelectItem
                                            item={props.item}>{props.item.rawValue}</SelectItem>}
                                    >
                                        <SelectTrigger class="w-full" id={`question-${index()}`}>
                                            <SelectValue<string>>{(state) => state.selectedOption() || "Select an option"}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent/>
                                    </Select>
                                </Match>
                            </Switch>
                        </div>
                    )}
                </For>
            </CardContent>
        </Card>
    );
}


//
// <h3 class="text-lg font-semibold mb-2">{question.title}</h3>
// <p class="text-gray-600 dark:text-gray-400 mb-4">{question.description}</p>