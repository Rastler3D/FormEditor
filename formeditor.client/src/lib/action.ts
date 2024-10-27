import {
    Accessor,
    createResource as solidResource,
    createSignal,
    createEffect,
    on,
    Resource,
    ResourceFetcher,
    InitializedResourceOptions,
    InitializedResourceReturn,
    ResourceOptions,
    ResourceReturn,
    ResourceSource,
    ResourceFetcherInfo,
    EffectFunction,
} from "solid-js";


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


    return Object.assign(setArgs, {data, args, reset}) as Action<T, S>;
}

const wrapError = <S, T, R>(fetcher: ResourceFetcher<S, T, R>) =>
    (k: S, info: ResourceFetcherInfo<T, R>) => {
        return new Promise<T>((resolve, reject) => {
            var res = fetcher(k, info);
            if (res instanceof Promise) {
                res.then(resolve).catch(err => reject(JSON.stringify(err)))
            } else {
                resolve(res);
            }
        })
    };

export function createResource<T, R = unknown>(
    fetcher: ResourceFetcher<true, T, R>,
    options: InitializedResourceOptions<NoInfer<T>, true>
): InitializedResourceReturn<T, R>;
export function createResource<T, R = unknown>(
    fetcher: ResourceFetcher<true, T, R>,
    options?: ResourceOptions<NoInfer<T>, true>
): ResourceReturn<T, R>;
export function createResource<T, S, R = unknown>(
    source: ResourceSource<S>,
    fetcher: ResourceFetcher<S, T, R>,
    options: InitializedResourceOptions<NoInfer<T>, S>
): InitializedResourceReturn<T, R>;
export function createResource<T, S, R = unknown>(
    source: ResourceSource<S>,
    fetcher: ResourceFetcher<S, T, R>,
    options?: ResourceOptions<NoInfer<T>, S>
): ResourceReturn<T, R>;
export function createResource<T, S, R>(
    pSource: ResourceSource<S> | ResourceFetcher<S, T, R>,
    pFetcher?: ResourceFetcher<S, T, R> | ResourceOptions<T, S>,
    pOptions?: ResourceOptions<T, S> | undefined
): ResourceReturn<T, R> {
    let source: ResourceSource<S>;
    let fetcher: ResourceFetcher<S, T, R>;
    let options: ResourceOptions<T, S>;
    if ((arguments.length === 2 && typeof pFetcher === "object") || arguments.length === 1) {
        source = true as ResourceSource<S>;
        fetcher = pSource as ResourceFetcher<S, T, R>;
        options = (pFetcher || {}) as ResourceOptions<T, S>;
    } else {
        source = pSource as ResourceSource<S>;
        fetcher = pFetcher as ResourceFetcher<S, T, R>;
        options = pOptions || ({} as ResourceOptions<T, S>);
    }

    const [resource, option] = solidResource(source, wrapError<S, T, R>(fetcher), options);

    // @ts-ignore
    const noArgs = () => typeof (source) != "function" ? !source : !source();
    const getResource = () => resource.error ? undefined : resource();
    const res = Object.defineProperties(getResource, {
        state: {
            get() {
                return resource.state == "unresolved" && noArgs() ? "unresolved" : resource.state;
            }
        },
        error: {
            get() {
                return (!resource.loading && resource.error) ? JSON.parse(resource.error.message) : undefined;
            }
        },
        loading: {
            get() {
                return resource.loading;
            }
        },
        latest: {
            get() {
                return resource.latest;
            }
        }
    }) as Resource<T>;
    return [res, option]
}

export function isResolved<T>(resource: Resource<T>): Accessor<boolean> {
    return () => resource.state === "ready"
}

export function resolve<T>(resource: Resource<T>, action: (value: T) => any): EffectFunction<void> {
    return on(isResolved(resource), (resolved) => { resolved && action(resource()!) })
}



