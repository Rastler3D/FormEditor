import {useTheme} from "~/contexts/ThemeContext";
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Button} from "~/components/ui/button";
import {Globe, LogOut, Moon, Sun, Search as SearchIcon, X, Menu, LogIn, Check} from "lucide-solid";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuShortcut,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar";
import {Language, useLanguage} from "~/contexts/LanguageContext";
import {useAuth} from "~/contexts/AuthContext";
import {useMatch, useNavigate} from "@solidjs/router";
import {createSignal, Show} from "solid-js";
import {Sheet, SheetContent, SheetTrigger, SheetClose} from "~/components/ui/sheet";
import Sidebar from "~/components/Sidebar";

const Header = () => {
    const { isDark, toggleTheme } = useTheme();
    const { setLanguage, t, language } = useLanguage();
    const { user, signOut } = useAuth();
    const match = useMatch(() => "/search");
    const navigate = useNavigate();
    const isActive = () => Boolean(match());

    const [query, setQuery] = createSignal("");
    const [isSearchOpen, setIsSearchOpen] = createSignal(false);

    const handleSearch = (e: SubmitEvent) => {
        e.preventDefault();
        navigate(`/search?query=${encodeURIComponent(query())}`);
        setQuery("");
        setIsSearchOpen(false);
    };

    return (
        <header class="bg-background sticky top-0 z-40 w-full border-b">
            <div class="mx-auto px-4">
                <div class="h-16 flex items-center justify-between">
                    <div class="flex items-center">
                        <Sheet>
                            <SheetTrigger as={Button} variant="ghost" size="icon" class="md:hidden mr-2">
                                <Menu class="h-5 w-5" />
                            </SheetTrigger>
                            <SheetContent position="left" class="w-60 p-0 !overflow-y-hidden">
                                <Sidebar isSheet />
                            </SheetContent>
                        </Sheet>
                        <h1 class="text-xl font-semibold md:hidden">{t('TemplateManager')}</h1>
                    </div>
                    <div class="flex-1 max-w-2xl mx-4 hidden md:block">
                        <Show when={!isActive()}>
                            <form onSubmit={handleSearch} class="flex gap-2">
                                <TextField value={query()} onChange={(value) => setQuery(value)} class="flex-1">
                                    <TextFieldInput
                                        type="search"
                                        placeholder={t('Search')}
                                        class="w-full"
                                    />
                                </TextField>
                                <Button type="submit">{t('Search')}</Button>
                            </form>
                        </Show>
                    </div>
                    <div class="flex items-center gap-2">
                        <Sheet open={isSearchOpen()} onOpenChange={setIsSearchOpen}>
                            <SheetTrigger as={Button} variant="ghost" size="icon" class="md:hidden">
                                <SearchIcon class="h-5 w-5" />
                                <span class="sr-only">{t('Search')}</span>
                            </SheetTrigger>
                            <SheetContent position="top" class="w-full p-4 h-24 flex items-end">
                                <form onSubmit={handleSearch} class="flex gap-2 w-full">
                                    <TextField value={query()} onChange={(value) => setQuery(value)} class="flex-1">
                                        <TextFieldInput
                                            type="search"
                                            placeholder={t('Search')}
                                            class="w-full"
                                        />
                                    </TextField>
                                    <Button type="submit">{t('Search')}</Button>
                                </form>
                                <SheetClose class="absolute right-4 top-4">
                                    <X class="h-4 w-4" />
                                    <span class="sr-only">{t('Cancel')}</span>
                                </SheetClose>
                            </SheetContent>
                        </Sheet>
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {isDark() ? <Sun class="h-5 w-5" /> : <Moon class="h-5 w-5" />}
                            <span class="sr-only">{t('ToggleTheme')}</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger as={Button} variant="ghost" size="icon">
                                <Globe class="h-5 w-5" />
                                <span class="sr-only">{t('SelectLanguage')}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => setLanguage(Language.En)}>
                                    English
                                    <DropdownMenuShortcut><Check size={15}  classList={{"hidden": language() != Language.En}} /></DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setLanguage(Language.Ru)}>Русский
                                    <DropdownMenuShortcut><Check size={15} classList={{"hidden": language() != Language.Ru}} /></DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Show
                            when={user()}
                            fallback={
                                <>
                                    <div class="flex gap-2 hidden md:flex">
                                        <Button variant="outline" onClick={() => navigate("/login")}>{t('SignIn')}</Button>
                                        <Button onClick={() => navigate("/registration")}>{t('SignUp')}</Button>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger as={Button} variant="ghost" size="icon" class="md:hidden">
                                            <LogIn />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent class="w-36">
                                            <DropdownMenuItem class="cursor-pointer" onSelect={() => navigate("/login")}>{t('SignIn')}</DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer" onSelect={() => navigate("/registration")}>{t('SignUp')}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            }
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger as={Button} variant="ghost" class="relative h-8 w-8 rounded-full">
                                    <Avatar class="h-8 w-8">
                                        <AvatarImage src={user()?.avatar} alt={user()?.name} />
                                        <AvatarFallback>{user()?.name.split(" ", 2).map((n) => n.charAt(0)).join("").toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent class="w-56">
                                    <DropdownMenuLabel class="font-normal">
                                        <div class="flex flex-col space-y-1">
                                            <p class="text-sm font-medium leading-none">{user()?.name}</p>
                                            <p class="text-xs leading-none text-muted-foreground">{user()?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem class="cursor-pointer" onSelect={() => navigate(`/users/${user()?.id}`)}>{t('Profile')}</DropdownMenuItem>
                                    <DropdownMenuItem class="cursor-pointer" onSelect={signOut}>
                                        <LogOut class="mr-2 h-4 w-4" />
                                        <span>{t('SignOut')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Show>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;