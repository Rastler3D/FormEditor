import {Accessor, createResource, createSignal, createEffect, on, Resource,} from "solid-js";


export type ActionFetcher<S, T> = (k: S) => Promise<T>;
export type Action<S, T> = {
    (args: S): void,
    data: Resource<T>,
    args: Accessor<S | undefined>,
    reset(): void
}


export function createAction<T, S>(action: ActionFetcher<T, S>, resetSignal?: Accessor<any>): Action<T, S> {
    const [args, setArgs] = createSignal<T>();
    const [data, {mutate}] = createResource(args, action);

    const reset = () => {
        setArgs(undefined);
        mutate(undefined);
    }

    createEffect(on(resetSignal ?? (() => {
    }), reset, {defer: true}));
    

    Object.defineProperties(setArgs, {data, args, reset });
    
    return action as Resource<T>
}

