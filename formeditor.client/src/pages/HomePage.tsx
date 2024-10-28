import {Show} from 'solid-js';
import TemplateGallery from '../components/TemplateGallery';
import TagCloud from '../components/TagCloud';
import {fetchLatestTemplates, fetchPopularTemplates, fetchTagsInfo} from "~/services/templateService.ts";
import {useNavigate} from "@solidjs/router";
import TemplateTable from "~/components/TemplateTable.tsx";
import {Card, CardContent, CardHeader, CardTitle} from '~/components/ui/card';
import {Alert, AlertDescription, AlertTitle} from "~/components/ui/alert.tsx";
import {AlertCircle} from 'lucide-solid';
import {createResource} from "~/lib/action.ts";
import {useLanguage} from "~/contexts/LanguageContext.tsx";

const HomePage = () => {
    const navigate = useNavigate();
    const [latestTemplates] = createResource(fetchLatestTemplates);
    const [popularTemplates] = createResource(fetchPopularTemplates);
    const [tags] = createResource(fetchTagsInfo);
    const {t} = useLanguage();

    return (
        <div class="container mx-auto px-4 py-8 space-y-12">
            <h1 class="text-4xl font-bold mb-8">{t('TemplateGallery')}</h1>

            <section>
                <Card>
                    <CardHeader>
                        <CardTitle class="text-2xl font-semibold">{t('LatestTemplates')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Show
                            when={!latestTemplates.loading}
                            fallback={<TemplateGallery isLoading={true} />}
                        >
                            <Show
                                when={latestTemplates()?.length > 0}
                                fallback={
                                    <Alert>
                                        <AlertCircle class="h-4 w-4" />
                                        <AlertTitle>{t('NoTemplatesFound')}</AlertTitle>
                                        <AlertDescription>
                                            {t('NoTemplatesAvailable')}
                                        </AlertDescription>
                                    </Alert>
                                }
                            >
                                <TemplateGallery templates={latestTemplates()} isLoading={false} />
                            </Show>
                        </Show>
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card>
                    <CardHeader>
                        <CardTitle class="text-2xl font-semibold">{t('PopularTemplates')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Show
                            when={!popularTemplates.loading}
                            fallback={<TemplateTable isLoading={true} />}
                        >
                            <Show
                                when={popularTemplates()?.length > 0}
                                fallback={
                                    <Alert>
                                        <AlertCircle class="h-4 w-4" />
                                        <AlertTitle>{t('NoTemplatesFound')}</AlertTitle>
                                        <AlertDescription>
                                            {t('NoTemplatesAvailable')}
                                        </AlertDescription>
                                    </Alert>
                                }
                            >
                                <TemplateTable templates={popularTemplates()} isLoading={false} />
                            </Show>
                        </Show>
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card>
                    <CardHeader>
                        <CardTitle class="text-2xl font-semibold"> {t('ExploreTags')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Show
                            when={!tags.loading}
                            fallback={<TagCloud isLoading={true} onTagClick={() => {}} />}
                        >
                            <Show
                                when={tags()?.length > 0}
                                fallback={
                                    <Alert>
                                        <AlertCircle class="h-4 w-4" />
                                        <AlertTitle>{t('NoTagsFound')}</AlertTitle>
                                        <AlertDescription>
                                            {t('NoTagsAvailable')}
                                        </AlertDescription>
                                    </Alert>
                                }
                            >
                                <TagCloud
                                    tags={tags()}
                                    isLoading={false}
                                    onTagClick={(tag) => navigate(`/search?tag=${encodeURIComponent(tag)}`)}
                                />
                            </Show>
                        </Show>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
};

export default HomePage;