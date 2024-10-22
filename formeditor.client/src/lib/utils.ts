import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {TableOption} from "~/types/template.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function optionToQueryParams(options: Partial<TableOption>) {
    const params = new URLSearchParams();
    if (options.pagination?.pageIndex){
        params.append('page', String(options.pagination?.pageIndex + 1));
    }
    if (options.pagination?.pageSize){
        params.append('pageSize', String(options.pagination?.pageSize));
    }
    if (options.filter){
        params.append('filter', options.filter);
    }
    if (options.sort){
        for(const sort of options.sort){
            if (sort.desc){
                params.append('sort', '-' + sort.id);
            } else {
                params.append('sort', sort.id);
            }
        }
    }
    
    return params
}

