import {MeiliSearch} from 'meilisearch'

console.log(import.meta.env.VITE_MEILISEARCH_URL);
console.log(import.meta.env.VITE_MEILISEARCH_API_KEY);
export const searchClient = new MeiliSearch({
    host: import.meta.env.VITE_MEILISEARCH_URL, 
    apiKey: import.meta.env.VITE_MEILISEARCH_API_KEY
})