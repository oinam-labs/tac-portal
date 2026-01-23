import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Settings, CreditCard, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileProps {
    collapsed?: boolean;
    className?: string;
}

interface User {
    name: string;
    email: string;
    role: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ collapsed, className }) => {
    const { user: appUser, logout: legacyLogout } = useStore();
    const { user: authUser, signOut } = useAuthStore();

    // Combine user data (prefer auth store but fallback to app store)
    const user = authUser || appUser;

    if (!user) return null;

    const handleSignOut = async () => {
        try {
            await signOut();
            legacyLogout();
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    // Get display name safely handling both User and StaffUser types
    const getDisplayName = () => {
        if ('fullName' in user) return user.fullName;
        if ('name' in user) return user.name;
        return 'User';
    };

    const displayName = getDisplayName();

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const displayEmail = user.email || '';
    const displayRole = (user.role || '').replace('_', ' ');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-all duration-200 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full",
                        collapsed ? "justify-center" : "justify-start",
                        className
                    )}
                >
                    <Avatar className="h-9 w-9 border border-border shrink-0">
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                            {getInitials(displayName)}
                        </AvatarFallback>
                    </Avatar>

                    {!collapsed && (
                        <>
                            <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                <span className="text-sm font-semibold truncate w-full text-foreground">
                                    {displayName}
                                </span>
                                <span className="text-xs text-muted-foreground truncate w-full">
                                    {displayRole}
                                </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-56 mb-2"
                align={collapsed ? "center" : "start"}
                side="right"
                sideOffset={collapsed ? 20 : 8}
                forceMount
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                            {displayEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
