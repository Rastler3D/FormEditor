import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface ProfileHeaderProps {
    name: string;
    avatar: string;
}

function ProfileHeader({ name, avatar }: ProfileHeaderProps) {
    return (
        <div class="flex flex-col items-center mb-6">
            <Avatar class="w-32 h-32 border-4 border-background shadow-xl">
                {avatar ? (
                    <AvatarImage src={avatar} alt={name} />
                ) : (
                    <AvatarFallback class="text-4xl">
                        {name
                            .split(" ", 2)
                            .map((n) => n.charAt(0))
                            .join("")
                            .toUpperCase()}
                    </AvatarFallback>
                )}
            </Avatar>
            <h1 class="mt-4 text-3xl font-bold text-foreground">{name}</h1>
        </div>
    );
}

export default ProfileHeader;