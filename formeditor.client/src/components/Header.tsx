import {useTheme} from "~/contexts/ThemeContext";
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Button} from "~/components/ui/button";
import {Globe, LogOut, Moon, Sun, Search as SearchIcon, X, Menu, LogIn} from "lucide-solid";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar";
import {Language, useLanguage} from "~/contexts/LanguageContext";
import {useAuth} from "~/contexts/AuthContext";
import {Separator} from "~/components/ui/separator";
import {useMatch, useNavigate} from "@solidjs/router";
import {createSignal, Show} from "solid-js";
import {Sheet, SheetContent, SheetTrigger, SheetClose} from "~/components/ui/sheet";
import Sidebar from "~/components/Sidebar";

const Header = () => {
    const {isDark, toggleTheme} = useTheme();
    const {setLanguage, t} = useLanguage();
    const {user, signOut} = useAuth();
    const match = useMatch(() => "/search");
    const navigate = useNavigate();
    const isActive = () => Boolean(match());

    const [query, setQuery] = createSignal("");
    const [isSearchOpen, setIsSearchOpen] = createSignal(false);

    const handleSearch = (e: SubmitEvent) => {
        e.preventDefault();
        navigate(`/search?query=${query()}`);
        setQuery("");
        setIsSearchOpen(false);
    };

    return (
        <header class="bg-background sticky top-0 z-40 w-full border-b">
            <div class="mx-auto px-4">
                <div class="h-16 flex items-center justify-between">
                    <div class="flex items-center">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" class="md:hidden mr-2">
                                    <Menu class="h-5 w-5"/>
                                </Button>
                            </SheetTrigger>
                            <SheetContent position="left" class="w-60 p-0 !overflow-y-hidden">
                                <Sidebar isSheet/>
                            </SheetContent>
                        </Sheet>
                        <h1 class="text-xl font-semibold md:hidden">Form Editor</h1>
                    </div>
                    <div class="flex-1 max-w-2xl mx-4 hidden md:block">
                        <Show when={!isActive()}>
                            <form onSubmit={handleSearch} class="flex gap-2">
                                <TextField value={query()} onChange={(value) => setQuery(value)} class="flex-1">
                                    <TextFieldInput
                                        type="search"
                                        placeholder="Search..."
                                        class="w-full"
                                    />
                                </TextField>
                                <Button type="submit">Search</Button>
                            </form>
                        </Show>
                    </div>
                    <div class="flex items-center gap-2">
                        <Sheet open={isSearchOpen()} onOpenChange={setIsSearchOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" class="md:hidden">
                                    <SearchIcon class="h-5 w-5"/>
                                    <span class="sr-only">Search</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent position="top" class="w-full p-4 h-24 flex items-end">
                                <form onSubmit={handleSearch} class="flex gap-2 w-full">
                                    <TextField value={query()} onChange={(value) => setQuery(value)} class="flex-1">
                                        <TextFieldInput
                                            type="search"
                                            placeholder="Search..."
                                            class="w-full"
                                        />
                                    </TextField>
                                    <Button type="submit">Search</Button>
                                </form>
                                <SheetClose class="absolute right-4 top-4">
                                    <X class="h-4 w-4"/>
                                    <span class="sr-only">Close</span>
                                </SheetClose>
                            </SheetContent>
                        </Sheet>
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {isDark() ? <Sun class="h-5 w-5"/> : <Moon class="h-5 w-5"/>}
                            <span class="sr-only">Toggle theme</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Globe class="h-5 w-5"/>
                                    <span class="sr-only">{t('Select language')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => setLanguage(Language.En)}>English</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setLanguage(Language.Es)}>Español</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setLanguage(Language.Fr)}>Français</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Show
                            when={user()}
                            fallback={
                                <>
                                    <div class="flex gap-2 hidden md:flex">
                                        <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
                                        <Button onClick={() => navigate("/registration")}>Sign Up</Button>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild class="md:hidden">
                                            <Button variant="ghost" size="icon">
                                                <LogIn/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent  class="w-36">
                                            <DropdownMenuItem class="cursor-pointer" onSelect={() => navigate("/login")}>Sign
                                                In</DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer"  onSelect={() => navigate("/registration")}>Sign
                                                Up</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            }
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                                        <Avatar class="h-8 w-8">
                                            <AvatarImage src={user()?.avatar} alt={user()?.name}/>
                                            <AvatarFallback>{user()?.name.split(" ").map((n) => n[0]).join("").toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent class="w-56">
                                    <DropdownMenuLabel class="font-normal">
                                        <div class="flex flex-col space-y-1">
                                            <p class="text-sm font-medium leading-none">{user()?.name}</p>
                                            <p class="text-xs leading-none text-muted-foreground">{user()?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem class="cursor-pointer"
                                                      onSelect={() => navigate(`/users/${user()?.id}`)}>Profile</DropdownMenuItem>
                                    <DropdownMenuItem class="cursor-pointer" onSelect={signOut}>
                                        <LogOut class="mr-2 h-4 w-4"/>
                                        <span>{t('Sign out')}</span>
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