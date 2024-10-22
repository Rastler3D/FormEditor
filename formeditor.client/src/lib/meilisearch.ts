import {MeiliSearch} from 'meilisearch'

export const searchClient = new MeiliSearch({
    host: import.meta.env.VITE_MEILISEARCH_URL, 
    apiKey: import.meta.env.VITE_MEILISEARCH_API_KEY
})