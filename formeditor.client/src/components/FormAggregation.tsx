import {createResource, For, Match, Show, Switch} from 'solid-js';
import {Card, CardContent, CardHeader, CardTitle} from '~/components/ui/card';
import {fetchAggregatedResults} from "~/services/templateService.ts";
import {QuestionTypes, Template} from "~/types/template.ts";
import {Skeleton} from "~/components/ui/skeleton.tsx";

interface FormAggregationProps {
    template: Template;
}

const FormAggregation = (props: FormAggregationProps) => {
    const [aggregatedResults] = createResource(() => props.template.id, fetchAggregatedResults);
    return (
        <div class="space-y-4">
            <For each={props.template.questions}>
                {(question) => (
                    <Card>
                        <CardHeader>
                            <CardTitle>{question.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Show when={aggregatedResults()?.questions?.[question.id]} keyed fallback={
                                <div>
                                    <p><Skeleton/></p>
                                </div>
                            }>
                                {(aggregation) => 
                                    <Switch>
                                        <Match when={question.type === QuestionTypes.Integer}>
                                            <div>
                                                <p>Average: {aggregation.averageNumber}</p>
                                                <p>Minimum: {aggregation.minNumber}</p>
                                                <p>Maximum: {aggregation.maxNumber}</p>
                                            </div>
                                        </Match>
                                        <Match when={question.type === QuestionTypes.SingleLine || question.type === QuestionTypes.MultiLine}>
                                            <div>
                                                <p>Most common answer: {aggregation.mostCommonText}</p>
                                                <p>Number of unique answers: {aggregation.uniqueCountText}</p>
                                            </div>
                                        </Match>
                                        <Match when={question.type === QuestionTypes.Checkbox}>
                                            <div>
                                                <p>'True' count: {aggregation.trueCountBoolean}</p>
                                                <p>'False' count: {aggregation.falseCountBoolean}</p>
                                            </div>
                                        </Match>
                                        <Match when={question.type === QuestionTypes.Select}>
                                            <div>
                                                <For each={aggregation.optionCountsSelect!}>
                                                    {({option, count}) => (
                                                        <p>'{option}' count: {count}</p>
                                                    )}
                                                </For>
                                            </div>
                                        </Match>
                                    </Switch>
                                }
                            </Show>
                        </CardContent>
                    </Card>
                )}
            </For>
        </div>
    );
};

export default FormAggregation;