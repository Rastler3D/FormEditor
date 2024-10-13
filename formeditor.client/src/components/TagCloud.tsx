import {createEffect, createSignal, onCleanup, onMount} from 'solid-js';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import {Skeleton} from "~/components/ui/skeleton.tsx";
import {TagInfo} from "~/types/template.ts";

interface TagCloudProps {
    tags?: TagInfo[],
    onTagClick: (tag: string) => void
    isLoading: boolean,
}
const TagCloud = (props: TagCloudProps) => {
    let svgRef: SVGSVGElement;
    let cloudLayout: ReturnType<typeof cloud>;
    const [hoveredTag, setHoveredTag] = createSignal(null as string | null);
    const [selectedTag, setSelectedTag] = createSignal(null as string | null);

    onMount(() => {
        const width = 500;
        const height = 300;

        cloudLayout = cloud()
            .size([width, height])
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font("Arial")
            .fontSize(d => d.size!)
            .on("end", draw);
    });

    createEffect(() => {
        if (!props.tags || props.tags.length === 0) return;

        const words = props.tags.map(d => ({text: d.name, size: 10 + d.count * 3}));

        // Limit the number of tags to improve performance
        const maxTags = 100;
        const limitedWords = words.slice(0, maxTags);

        cloudLayout.words(limitedWords);
        cloudLayout.start();
    });

    const draw = (tags: cloud.Word[]) => {
        d3.select(svgRef).selectAll("*").remove();

        const svg = d3.select(svgRef)
            .attr("width", cloudLayout.size()[0])
            .attr("height", cloudLayout.size()[1])
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
            .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
            .text(d => d.text!)
            .attr("role", "button")
            .attr("tabindex", "0")
            .attr("aria-pressed", d => selectedTag() === d.text ? "true" : "false")
            .on("click", (_, d) => {
                setSelectedTag(d.text!);
                if (props.onTagClick) {
                    props.onTagClick(d.text!);
                }
            })
            .on("keydown", (event, d) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedTag(d.text!);
                    if (props.onTagClick) {
                        props.onTagClick(d.text!);
                    }
                }
            })
            .on("mouseover", (event, d) => {
                setHoveredTag(d.text!);
                d3.select(event.target).style("cursor", "pointer");
            })
            .on("mouseout", () => {
                setHoveredTag(null);
            })
            .style("transition", "all 0.3s ease")
            .style("cursor", "pointer")
            .style("opacity", d => (hoveredTag() && hoveredTag() !== d.text) ? 0.3 : 1)
            .style("font-weight", d => (selectedTag() === d.text) ? "bold" : "normal")
            .style("text-decoration", d => (selectedTag() === d.text) ? "underline" : "none");
    }

    onCleanup(() => {
        d3.select(svgRef).selectAll("*").remove();
    });

    return <div>{ props.isLoading? <Skeleton></Skeleton> : <svg ref={svgRef!}></svg> }</div>;
};

export default TagCloud;