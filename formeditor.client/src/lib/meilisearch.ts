import {MeiliSearch} from 'meilisearch'

export const searchClient = new MeiliSearch({
    host: import.meta.env.VITE_MEILISEARCH_URL ?? "https://meilisearch-rastler3d.up.railway.app", 
    apiKey: import.meta.env.VITE_MEILISEARCH_API_KEY ?? "gdvwfp4jb2bnr9wy79ocme33e8yafewl"
})