import {MeiliSearch} from 'meilisearch'

export const searchClient = new MeiliSearch({
    host: 'http://localhost:7700', 
    apiKey: import.meta.env.VITE_MEILISEARCH_API_KEY
})