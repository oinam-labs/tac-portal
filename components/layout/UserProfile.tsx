import React, { useState } from 'react';
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
import { ProfileDialog } from '../domain/ProfileDialog';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const [showProfileDialog, setShowProfileDialog] = useState(false);

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
    const avatarUrl = 'avatarUrl' in user ? user.avatarUrl : undefined;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "flex items-center gap-3 p-1.5 md:p-2 rounded-lg hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full border border-transparent hover:border-sidebar-border/50",
                            collapsed ? "justify-center" : "justify-between",
                            className
                        )}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar className="h-8 w-8 border border-border/40 shrink-0 shadow-sm">
                                <AvatarImage src={avatarUrl || ''} alt={displayName} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                    {getInitials(displayName)}
                                </AvatarFallback>
                            </Avatar>

                            {!collapsed && (
                                <div className="flex flex-col items-start text-left min-w-0">
                                    <span className="text-sm font-semibold truncate w-full text-foreground leading-tight">
                                        {displayName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate w-full leading-tight">
                                        {displayRole}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!collapsed && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
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
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setShowProfileDialog(true)}
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => navigate('/settings')}
                        >
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

            <ProfileDialog
                open={showProfileDialog}
                onOpenChange={setShowProfileDialog}
            />
        </>
    );
};
