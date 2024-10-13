import { createSignal, createEffect, createResource } from 'solid-js';
import { Link } from 'solid-app-router';
import { useLanguage } from '../components/LanguageProvider';
import TemplateGallery from '../components/TemplateGallery';
import PopularTemplates from '../components/PopularTemplates';
import TagCloud from '../components/TagCloud';
import {fetchLatestTemplates, fetchPopularTemplates, fetchTags} from "~/services/api.ts";
import {useNavigate} from "@solidjs/router";

const HomePage = () => {
    
    const navigate = useNavigate();
    const [latestTemplates] = createResource(fetchLatestTemplates);
    const [popularTemplates] = createResource(fetchPopularTemplates);
    const [tags] = createResource(fetchTags);

    return (
        <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold mb-6">Home</h1>

            <section class="mb-8">
                <h2 class="text-2xl font-semibold mb-4">Latest Templates</h2>
                <TemplateGallery templates={latestTemplates()} isLoading={latestTemplates.loading} />
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-semibold mb-4">Popular Templates</h2>
                <PopularTemplates templates={popularTemplates()} isLoading={popularTemplates.loading}  />
            </section>

            <section>
                <h2 class="text-2xl font-semibold mb-4">Tags</h2>
                <TagCloud tags={tags()} isLoading={tags.loading} onTagClick={(tag => navigate(`/search?tag=${tag}`))} />
            </section>
        </div>
    );
};

export default HomePage;