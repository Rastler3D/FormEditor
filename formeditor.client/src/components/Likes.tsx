import {Template} from "../types/template";
import {Button} from "./ui/button";
import {createResource, createEffect, Show} from "solid-js";
import {createAction} from "~/lib/action";
import {fetchLikes, toggleLike} from "~/services/templateService.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";
import { Heart } from "lucide-solid";
import { Oval } from "solid-spinner";

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
        toggleLikes({ templateId: props.template.id, isLiked: likesInfo()!.isLiked });
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
        <div class="flex justify-end items-center mb-4">
            <Show when={likesInfo()} fallback={
                <Button variant="outline"
                        class="text-primary inline-flex items-center" disabled>
                    <Heart class={`h-4 w-4`} />
                    <span class="ml-1"><Oval width="24" height="24" /></span>
                </Button>
            } >
                {(likesInfo) => (
                    <Button onClick={handleToggleLike} variant="outline" disabled={!user()}
                            class="text-primary inline-flex items-center">
                        <Heart class="h-4 w-4" classList={{'fill-current' : likesInfo().isLiked}} />
                        <span class="ml-1">{likesInfo().likes} Likes</span>
                    </Button>
                )}
               
            </Show>
            
        </div>
    )
}