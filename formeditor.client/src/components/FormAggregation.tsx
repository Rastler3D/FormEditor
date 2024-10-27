import {createResource, For, Match, Show, Switch, createMemo} from 'solid-js';
import {Card, CardContent, CardHeader, CardTitle} from '~/components/ui/card';
import {fetchAggregatedResults} from "~/services/templateService";
import {QuestionTypes, Template} from "~/types/types.ts";
import {Skeleton} from "~/components/ui/skeleton";
import {Progress} from "~/components/ui/progress";
import {Badge} from "~/components/ui/badge";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "~/components/ui/tabs";
import {Chart, Title, Tooltip, Legend, Colors} from 'chart.js';
import {Pie, Bar} from 'solid-chartjs';
import {Aggregation} from '~/types/types.ts';

Chart.register(Title, Tooltip, Legend, Colors);

interface FormAggregationProps {
    template: Template;
}

const FormAggregation = (props: FormAggregationProps) => {
    const [aggregatedResults] = createResource(() => props.template.id, fetchAggregatedResults);

    const getChartData = (question: QuestionTypes, aggregation: Aggregation) => {
        switch (question) {
            case QuestionTypes.Integer:
                return {
                    labels: ['Minimum', 'Average', 'Maximum'],
                    datasets: [{
                        data: [aggregation.minNumber, aggregation.averageNumber, aggregation.maxNumber],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                    }]
                };
            case QuestionTypes.Checkbox:
                return {
                    labels: ['True', 'False'],
                    datasets: [{
                        data: [aggregation.trueCountBoolean, aggregation.falseCountBoolean],
                        backgroundColor: ['#36A2EB', '#FF6384']
                    }]
                };
            case QuestionTypes.Select:
                return {
                    labels: aggregation.optionCountsSelect!.map(option => option.option),
                    datasets: [{
                        data: aggregation.optionCountsSelect!.map(option => option.count),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                    }]
                };
            default:
                return {
                    labels: ['Unique Answers'],
                    datasets: [{
                        data: [aggregation.uniqueCountText],
                        backgroundColor: ['#36A2EB']
                    }]
                };
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <form class="space-y-6">
                <CardHeader>
                    <h2 class="text-2xl font-bold">Form Aggregation</h2>
                </CardHeader>
                <CardContent>
                    <div class="space-y-6">
                        <For each={props.template.questions}>
                            {(question) => (
                                <Card>
                                    <CardHeader>
                                        <CardTitle class="flex justify-between items-center">
                                            <span>{question.title}</span>
                                            <Badge>{question.type}</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Show when={aggregatedResults()?.questions?.[question.id]} keyed fallback={
                                            <div class="space-y-2">
                                                <Skeleton class="!h-4 !w-full"/>
                                                <Skeleton class="!h-4 !w-3/4"/>
                                                <Skeleton class="!h-4 !w-1/2"/>
                                            </div>
                                        }>
                                            {(aggregation) => {
                                                const chartData = createMemo(() => getChartData(question.type, aggregation));
                                                return (
                                                    <Tabs defaultValue="summary" class="w-full">
                                                        <TabsList>
                                                            <TabsTrigger value="summary">Summary</TabsTrigger>
                                                            <TabsTrigger value="chart">Chart</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="summary">
                                                            <Switch>
                                                                <Match when={question.type === QuestionTypes.Integer}>
                                                                    <div class="space-y-4">
                                                                        <div>
                                                                            <span
                                                                                class="font-semibold">Average:</span> {aggregation.averageNumber?.toFixed(2) ?? "-"}
                                                                        </div>
                                                                        <div>
                                                                            <span
                                                                                class="font-semibold">Minimum:</span> {aggregation.minNumber ?? "-"}
                                                                        </div>
                                                                        <div>
                                                                            <span
                                                                                class="font-semibold">Maximum:</span> {aggregation.maxNumber ?? "-"}
                                                                        </div>
                                                                        <Progress
                                                                            value={(aggregation.averageNumber! - aggregation.minNumber!) / (aggregation.maxNumber! - aggregation.minNumber!) * 100}
                                                                            class="w-full"/>
                                                                    </div>
                                                                </Match>
                                                                <Match
                                                                    when={question.type === QuestionTypes.SingleLine || question.type === QuestionTypes.MultiLine}>
                                                                    <div class="space-y-4">
                                                                        <div>
                                                                            <span class="font-semibold">Most common answer:</span> {aggregation.mostCommonText ?? "-"}
                                                                        </div>
                                                                        <div>
                                                                            <span class="font-semibold">Number of unique answers:</span> {aggregation.uniqueCountText}
                                                                        </div>
                                                                    </div>
                                                                </Match>
                                                                <Match when={question.type === QuestionTypes.Checkbox}>
                                                                    <div class="space-y-4">
                                                                        <div>
                                                                            <span
                                                                                class="font-semibold">True count:</span> {aggregation.trueCountBoolean}
                                                                        </div>
                                                                        <div>
                                                                            <span
                                                                                class="font-semibold">False count:</span> {aggregation.falseCountBoolean}
                                                                        </div>
                                                                        <Progress
                                                                            value={aggregation.trueCountBoolean / (aggregation.trueCountBoolean + aggregation.falseCountBoolean) * 100}
                                                                            class="w-full"/>
                                                                    </div>
                                                                </Match>
                                                                <Match when={question.type === QuestionTypes.Select}>
                                                                    <div class="space-y-4">
                                                                        <For each={aggregation.optionCountsSelect}>
                                                                            {({option, count}) => (
                                                                                <div>
                                                                                    <span
                                                                                        class="font-semibold">{option}:</span> {count}
                                                                                </div>
                                                                            )}
                                                                        </For>
                                                                    </div>
                                                                </Match>
                                                            </Switch>
                                                        </TabsContent>
                                                        <TabsContent value="chart">
                                                            <div class="h-64">
                                                                <Switch>
                                                                    <Match
                                                                        when={question.type === QuestionTypes.Integer || question.type === QuestionTypes.Select}>
                                                                        <Bar data={chartData()} options={chartOptions}/>
                                                                    </Match>
                                                                    <Match
                                                                        when={question.type === QuestionTypes.Checkbox || question.type === QuestionTypes.SingleLine || question.type === QuestionTypes.MultiLine}>
                                                                        <Pie data={chartData()} options={chartOptions}/>
                                                                    </Match>
                                                                </Switch>
                                                            </div>
                                                        </TabsContent>
                                                    </Tabs>
                                                );
                                            }}
                                        </Show>
                                    </CardContent>
                                </Card>
                            )}
                        </For>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
};

export default FormAggregation;