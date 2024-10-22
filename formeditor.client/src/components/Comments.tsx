import {createSignal, createEffect, For, onCleanup} from 'solid-js';
import {HubConnectionBuilder, HubConnection} from '@microsoft/signalr';
import {Card, CardContent, CardFooter, CardHeader} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {useAuth} from '~/contexts/AuthContext';
import {Template} from "~/types/template.ts";
import {TextField, TextFieldInput} from "~/components/ui/text-field.tsx";
import {showToast} from "~/components/ui/toast.tsx";
import {FaSolidComment} from "solid-icons/fa";
import {Comment} from "~/types/template.ts";

interface CommentsProps {
    template: Template;
}

export default function Comments(props: CommentsProps) {
    const [comments, setComments] = createSignal<Comment[]>([]);
    const [newComment, setNewComment] = createSignal('');
    const [error, setError] = createSignal<string>();
    const [connection, setConnection] = createSignal<HubConnection>();
    const {user, refreshToken} = useAuth();

    createEffect(() => {
        const builder = new HubConnectionBuilder();
        if (user()) {
            builder.withUrl(`${import.meta.env.VITE_HUB_URL}/comment`, {accessTokenFactory: async () => (await refreshToken())!})
        } else {
            builder.withUrl(`${import.meta.env.VITE_HUB_URL}/comment`)
        }
        const newConnection = builder
            .withAutomaticReconnect()
            .build();
        
        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                newConnection.invoke('JoinFormGroup', props.template.id);
            })
            .catch(err => console.error('SignalR Connection Error: ', err));
        newConnection.on('InitialComments', (comments: Comment[]) => {
            setComments(comments);
        });
        newConnection.on('ReceiveComment', (comment: Comment) => {
            setComments(prev => [...prev, comment]);
        });
        newConnection.on('Error', (comment: {message: string}) => {
            setError(comment.message);
        });

        onCleanup(() => newConnection.stop())
    });

    const sendComment = async () => {
        if (newComment().trim() && connection()) {
            try {
                await connection()!.invoke('SendComment', props.template.id, newComment());
                setNewComment('');
            } catch (err) {
                showToast({
                    title: "Error",
                    description: "Failed to send comment",
                    variant: "destructive"
                })
            }
        }
    };

    return (
        <Card>
            <div class="mt-8">
                <CardHeader><h3 class="text-xl font-semibold mb-4">Comments</h3></CardHeader>
                <CardContent>
                    <div class="space-y-4 max-h-60 overflow-y-auto">
                        <For each={comments()}>
                            {(comment) => (
                                <Card class="bg-accent">
                                    <div class="p-4">
                                        <p class="mb-2">{comment.text}</p>
                                        <div class="text-sm text-muted-foreground flex justify-between">
                                            <span>{comment.author}</span>
                                            <span>{new Date(comment.date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </For>
                    </div>
                </CardContent>
                <CardFooter>
                    <div class="mt-4">
                        <TextField value={newComment()} onChange={(value) => setNewComment(value)}>
                            <TextFieldInput
                                type="text"
                                placeholder="Add a comment..."
                                class="mb-2 w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                            />
                        </TextField>
                        {error() && <span>{error()}</span>}
                        <Button onClick={sendComment}
                                disabled={!connection() || !user()}
                                class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center">
                            <FaSolidComment class="mr-2"/>
                            <span>Send</span>
                        </Button>
                    </div>
                </CardFooter>
            </div>
        </Card>
    );
}