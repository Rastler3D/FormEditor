import {useTheme} from "../contexts/ThemeContext";
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Button} from "~/components/ui/button";
import {Globe, LogOut, Moon, Sun} from "lucide-solid";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar";
import {useLanguage} from "~/contexts/LanguageContext";
import {useAuth} from "~/contexts/AuthContext";
import {Separator} from "~/components/ui/separator";
import {Sheet, SheetContent, SheetTrigger} from "~/components/ui/sheet";
import Sidebar from "~/components/Sidebar.tsx";
import {FaSolidBars} from "solid-icons/fa";

const Header = () => {
    const {isDark, toggleTheme} = useTheme();
    const {setLanguage, t} = useLanguage();
    const {user, signOut, signIn} = useAuth();

    return (
        <header>
            <div class="h-16 px-4 flex items-center justify-between">
                <div class="flex items-start flex-1 ">
                    <Sheet >
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" class="md:hidden">
                                <FaSolidBars class="h-4 w-4"/>
                            </Button>
                        </SheetTrigger>
                        <SheetContent  position="left" class="w-60 p-0 !overflow-y-hidden">
                            <Sidebar isSheet={true} />
                        </SheetContent>
                    </Sheet>
                </div>
                <div class="flex items-center flex-1 max-w-3xl">
                    <TextField>
                        <TextFieldInput
                            type="search"
                            placeholder={'Search...'}
                            class="h-9 md:w-[300px] lg:w-[400px] w-full text-gray-500"
                        />
                    </TextField>
                </div>
                <div class="flex items-center space-x-4">
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
                            <DropdownMenuItem onSelect={() => setLanguage('en')}>
                                English
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setLanguage('es')}>
                                Español
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setLanguage('fr')}>
                                Français
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                                <Avatar class="h-8 w-8">
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <span class="sr-only">{t('User menu')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent class="w-56">
                            <DropdownMenuLabel class="font-normal">
                                <div class="flex flex-col space-y-1">
                                    <p class="text-sm font-medium leading-none">{user()?.name}</p>
                                    <p class="text-xs leading-none text-muted-foreground">
                                        {user()?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={signOut}>
                                <span>{t('Sign out')}</span>
                                <DropdownMenuShortcut><LogOut class="mr-2 h-4 w-4"/></DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <Separator/>
        </header>
    );
};

export default Header;