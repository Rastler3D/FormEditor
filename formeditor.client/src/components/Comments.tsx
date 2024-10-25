import {createSignal, createEffect, For, onCleanup} from 'solid-js';
import {HubConnectionBuilder, HubConnection, HttpTransportType} from '@microsoft/signalr';
import {Card, CardContent, CardFooter, CardHeader} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {useAuth} from '~/contexts/AuthContext';
import {Template} from "~/types/template.ts";
import {TextField, TextFieldInput} from "~/components/ui/text-field.tsx";
import {showToast} from "~/components/ui/toast.tsx";
import {Comment} from "~/types/template.ts";
import { MessageSquare } from 'lucide-solid';



interface CommentsProps {
    template: Template;
}

export default function Comments(props: CommentsProps) {
    const [comments, setComments] = createSignal<Comment[]>([]);
    const [newComment, setNewComment] = createSignal('');
    const [error, setError] = createSignal<string>();
    const [connection, setConnection] = createSignal<HubConnection>();
    const { user, accessToken } = useAuth();

    createEffect(() => {
        const builder = new HubConnectionBuilder();
        if (user()) {
            builder.withUrl(`${import.meta.env.VITE_HUB_URL}/comment`, { accessTokenFactory: accessToken, transport: HttpTransportType.ServerSentEvents  });
        } else {
            builder.withUrl(`${import.meta.env.VITE_HUB_URL}/comment`, { transport: HttpTransportType.ServerSentEvents })
        }
        const newConnection = builder
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                newConnection.invoke('JoinFormGroup', props.template.id);
            })
            .catch(err => {
                console.error('SignalR Connection Error: ', err);
                setError('Failed to connect to the comment service. Please try again later.');
            });

        newConnection.on('InitialComments', (comments: Comment[]) => {
            setComments(comments);
        });

        newConnection.on('ReceiveComment', (comment: Comment) => {
            setComments(prev => [...prev, comment]);
        });

        newConnection.on('Error', (errorMessage: { message: string }) => {
            setError(errorMessage.message);
        });

        onCleanup(() => {
            if (newConnection.state === 'Connected') {
                newConnection.stop()
                    .catch(err => console.error('Error stopping SignalR connection:', err));
            }
        });
    });

    const sendComment = async () => {
        if (newComment().trim() && connection()) {
            try {
                await connection()!.invoke('SendComment', props.template.id, newComment());
                setNewComment('');
                setError(undefined);
            } catch (err) {
                console.error('Error sending comment:', err);
                showToast({
                    title: "Error",
                    description: "Failed to send comment. Please try again.",
                    variant: "destructive"
                });
            }
        }
    };

    return (
        <Card class="mt-8 shadow-lg">
            <CardHeader>
                <h3 class="text-xl font-semibold">Comments</h3>
            </CardHeader>
            <CardContent>
                <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    <For each={comments()}>
                        {(comment) => (
                            <Card class="bg-accent">
                                <CardContent class="p-4">
                                    <p class="mb-2">{comment.text}</p>
                                    <div class="text-sm text-muted-foreground flex justify-between">
                                        <span>{comment.author}</span>
                                        <span>{new Date(comment.date).toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </For>
                </div>
            </CardContent>
            <CardFooter>
                <div class="w-full space-y-2">
                    <TextField value={newComment()} onChange={(value) => setNewComment(value)}>
                        <TextFieldInput
                            type="text"
                            placeholder="Add a comment..."
                            class="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
                        />
                    </TextField>
                    {error() && <p class="text-sm text-destructive">{error()}</p>}
                    <Button
                        onClick={sendComment}
                        disabled={!connection() || !user() || !newComment().trim()}
                        class="w-full bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center"
                    >
                        <MessageSquare class="mr-2 h-4 w-4" />
                        <span>Send</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}