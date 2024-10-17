import {Template} from "../types/template";
import {Button} from "./ui/button";
import {createWritableMemo} from "@solid-primitives/memo";
import {createResource, createEffect} from "solid-js";
import {createAction} from "~/lib/action";
import {FaSolidHeart} from "solid-icons/fa";
import {fetchLikes, toggleLike} from "~/services/api";
import {ProgressCircle} from "~/components/ui/progress-circle.tsx";
import {useAuth} from "~/contexts/AuthContext.tsx";

interface LikesProps {
    template: Template;
}

export default function Likes(props: LikesProps) {
    const {user} = useAuth();
    const [likesInfo, {mutate}] = createResource(() => props.template.id, fetchLikes);
    const toggleLikes = createAction(toggleLike, () => props.template.id);
    createEffect(() => {
        if (toggleLikes.data()) {
            mutate(toggleLikes.data());
        }
        if (toggleLikes.data.error) {
            mutate(likesInfo.latest)
        }
    })
    const handleToggleLike = async () => {
        toggleLikes(props.template.id);
        if (likesInfo().isLiked) {
            mutate(prev => ({
                likes: prev.likes - 1,
                isLiked: false
            }))
        } else {
            mutate(prev => ({
                likes: prev.likes + 1,
                isLiked: true
            }))
        }

    };

    return (
        <div className="flex justify-between items-center mb-4">
            <Show when={likesInfo()} fallback={
                <Button variant="outline"
                        class="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center">
                    <FaSolidHeart class="mr-2"/>
                    <span><ProgressCircle showAnimation /></span>
                </Button>
            }>
                <Button onClick={handleToggleLike} variant="outline" disabled={!user()}>
                        class="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center">
                    <FaSolidHeart class="mr-2"/>
                    <span>{template().likes} Likes</span>
                </Button>
            </Show>
            
        </div>
    )
}