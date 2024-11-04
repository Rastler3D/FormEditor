import {createSignal, createEffect, Show, createMemo, on} from "solid-js";
import {useLocation, useParams} from "@solidjs/router";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "~/components/ui/dialog";
import {Label} from "~/components/ui/label";
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Button} from "~/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {createAction} from "~/lib/action";
import {Oval} from "solid-spinner";
import {createTicket} from "~/services/jiraService.ts";
import { showToast } from "./ui/toast";

interface TicketDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TicketDialog(props: TicketDialogProps) {
    const params = useParams();
    const location = useLocation();
    const [summary, setSummary] = createSignal("");
    const [description, setDescription] = createSignal("");
    const link= createMemo(on(() => 
        location.pathname || 
        location.search || 
        location.query, 
        () => window.location.href));
    const template = createMemo(() => params.templateId && Number(params.templateId));
    const [priority, setPriority] = createSignal("Average" as "Average" | "Low" | "High");

    const ticketCreation = createAction(createTicket);

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        ticketCreation({
            summary: summary(),
            priority: priority(),
            description: description(),
            templateId: template(),
            link: link(),
        });
    };

    createEffect(() => {
        if (ticketCreation.data.error) {
            showToast({
                title: "Failed to create ticket",
                description: ticketCreation.data.error.detail,
                variant: "destructive",
            });
        }
        if (ticketCreation.data()) {
            showToast({
                title: "Ticket Created",
                description: `Your ticket has been created successfully. 
                You can view it at: ${ticketCreation.data()}`,
                variant: "success",
            });
            props.onOpenChange(false);
            setSummary("");
            setPriority("Average");
        }
    });

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                    <DialogDescription>Submit a new support ticket to our Jira system.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} class="space-y-4">
                    <div class="space-y-2">
                        <Label for="summary">Summary</Label>
                        <TextField value={summary()} onChange={setSummary}>
                            <TextFieldInput type="text" id="summary" placeholder="Summary of the issue"
                                            required/>
                        </TextField>
                    </div>
                    <div class="space-y-2">
                        <Label for="summary">Description</Label>
                        <TextField value={description()} onChange={setDescription}>
                            <TextFieldInput type="text" id="summary" placeholder="Brief description of the issue"
                                            required/>
                        </TextField>
                    </div>
                    <div class="space-y-2">
                        <Label for="link">Link</Label>
                        <TextField readOnly disabled value={link()}>
                            <TextFieldInput type="text" id="link" placeholder="Link"
                                            required/>
                        </TextField>
                    </div>
                    <Show when={template()}>
                        <div class="space-y-2">
                            <Label for="template">Template ID</Label>
                            <TextField readOnly disabled value={template().toString()}>
                                <TextFieldInput type="number" id="template" placeholder="Template"
                                                required/>
                            </TextField>
                        </div>
                    </Show>

                    <div class="space-y-2">
                        <Label for="priority">Priority</Label>
                        <Select
                            value={priority()}
                            options={["High", "Average", "Low"]}
                            onChange={setPriority}
                            itemComponent={(props) => (
                                <SelectItem item={props.item} class="cursor-pointer">
                                    {props.item.rawValue}
                                </SelectItem>
                            )}>
                            <SelectTrigger>
                                <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                            </SelectTrigger>
                            <SelectContent/>
                        </Select>

                    </div>
                    <div class="flex justify-end">
                        <Button type="submit" disabled={ticketCreation.data.loading}>
                            {ticketCreation.data.loading ? <Oval width="24" height="24"/> : "Create Ticket"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
        ;
}