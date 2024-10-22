import {Template} from "../types/template";
import {Button} from "./ui/button";
import {createResource, createEffect, Show} from "solid-js";
import {createAction} from "~/lib/action";
import {fetchLikes, toggleLike} from "~/services/templateService.ts";
import {ProgressCircle} from "~/components/ui/progress-circle.tsx";
import {useAuth} from "~/contexts/AuthContext.tsx";
import { Heart } from "lucide-solid";

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
        if (likesInfo()!.isLiked) {
            mutate(prev => ({
                likes: prev!.likes - 1,
                isLiked: false
            }))
        } else {
            mutate(prev => ({
                likes: prev!.likes + 1,
                isLiked: true
            }))
        }

    };

    return (
        <div class="flex justify-between items-center mb-4">
            <Show when={likesInfo()} fallback={
                <Button variant="outline"
                        class="text-primary inline-flex items-center" disabled>
                    <Heart class={`h-4 w-4`} />
                    <span><ProgressCircle showAnimation /></span>
                </Button>
            } >
                {(likesInfo) => (
                    <Button onClick={handleToggleLike} variant="outline" disabled={!user()}
                            class="text-primary inline-flex items-center">
                        <Heart class="h-4 w-4" classList={{'fill-current' : likesInfo().isLiked}} />
                        <span>{likesInfo().likes} Likes</span>
                    </Button>
                )}
               
            </Show>
            
        </div>
    )
}