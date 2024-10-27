import {createEffect, createSignal, onCleanup, onMount} from 'solid-js';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import {Skeleton} from "~/components/ui/skeleton.tsx";
import {TagInfo} from "~/types/types.ts";

interface TagCloudProps {
    tags?: TagInfo[];
    onTagClick: (tag: string) => void;
    isLoading: boolean;
}

const TagCloud = (props: TagCloudProps) => {
    let svgRef: SVGSVGElement;
    let cloudLayout: ReturnType<typeof cloud>;
    const [selectedTag, setSelectedTag] = createSignal<string | null>(null);
    const width = 800;
    const height = 400;
    onMount(() => {


        cloudLayout = cloud()
            .size([width, height])
            .padding(5)
            .rotate(() => 0)
            .font("Arial")
            .fontSize(d => d.size)
            .padding(5)
            .rotate(0) // No rotation for horizontal text
            .spiral('archimedean') // Use archimedean spiral for more elliptical shape
            .random(() => 0.5) // Consistent layout
            .on("end", draw);
    });

    createEffect(() => {
        if (!props.tags || props.tags.length === 0) return;

        const maxCount = Math.max(...props.tags.map(tag => tag.count));
        const minCount = Math.min(...props.tags.map(tag => tag.count));
        const fontSize = d3.scaleLinear()
            .domain([minCount, maxCount])
            .range([50, 100]);
        const words = props.tags.map(d => ({text: d.name, size: fontSize(d.count)}));
        const maxTags = 100;
        const limitedWords = words.slice(0, maxTags);

        cloudLayout.words(limitedWords);
        cloudLayout.start();
    });
    
    const draw = (tags: cloud.Word[]) => {
        d3.select(svgRef).selectAll("*").remove();

        const svg = d3.select(svgRef)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${cloudLayout.size()[0]} ${cloudLayout.size()[1]}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("aria-label", "Tag cloud");

        const group = svg.append("g")
            .attr("transform", `translate(${cloudLayout.size()[0] / 2},${cloudLayout.size()[1] / 2})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);
       
        group.selectAll("text")
            .data(tags)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("font-family", "Arial")
            .style("fill", (_, i) => color(i))
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${[d.x, d.y]})`)
            .text(d => d.text!)
            .attr("role", "button")
            .attr("tabindex", "0")
            .attr('data-id', d => d.text)
            .attr("aria-pressed", d => selectedTag() === d.text ? "true" : "false")
            .on("click", (_, d) => {
                setSelectedTag(d.text!);
                props.onTagClick(d.text!);
            })
            .on("keydown", (event, d) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedTag(d.text!);
                    props.onTagClick(d.text!);
                }
            })
            .on("mouseout", (event, d) => {
                d3.select(event.target)
                    .transition()
                    .duration(300)
                    .style("font-size", `${d.size}px`);
                d3.selectAll("text")
                    .data(tags)
                    .style("opacity", 1)
            })
            .on("mouseover", (event, d) => {
                d3.selectAll("text")
                    .data(tags)
                    .style("opacity", j => j.text == d.text ? 1 : 0.3)
                d3.select(event.target)
                    .style("cursor", "pointer")
                    .transition()
                    .duration(300)
                    .style("font-size", `${(d.size as number) * 1.2}px`);
            })
            .style("transition", "all 0.8s ease")
            .style("cursor", "pointer")
            .style("font-weight", d => (selectedTag() === d.text) ? "bold" : "normal")
            .style("text-decoration", d => (selectedTag() === d.text) ? "underline" : "none");
    }

    onCleanup(() => {
        d3.select(svgRef).selectAll("*").remove();
    });

    return (
        <div class="w-full h-[400px] flex items-center justify-center">
            {props.isLoading ? (
                <Skeleton class="!w-full !h-full"/>
            ) : (
                <svg ref={svgRef!} class="w-full h-full"/>
            )}
        </div>
    );
};

export default TagCloud;