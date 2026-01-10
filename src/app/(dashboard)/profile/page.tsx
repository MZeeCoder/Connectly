import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
    return (
        <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border border-border bg-card p-8">
                <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <Avatar size="xl" fallback="U" />
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="mb-2 text-2xl font-bold text-foreground">
                            User Profile
                        </h1>
                        <p className="mb-4 text-muted-foreground">@username</p>
                        <Button variant="outline">Edit Profile</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="mb-2 font-semibold text-foreground">Bio</h2>
                        <p className="text-muted-foreground">
                            This is where your bio will appear. Share something about yourself!
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-lg bg-background p-4 text-center">
                            <p className="text-2xl font-bold text-foreground">0</p>
                            <p className="text-sm text-muted-foreground">Posts</p>
                        </div>
                        <div className="rounded-lg bg-background p-4 text-center">
                            <p className="text-2xl font-bold text-foreground">0</p>
                            <p className="text-sm text-muted-foreground">Followers</p>
                        </div>
                        <div className="rounded-lg bg-background p-4 text-center">
                            <p className="text-2xl font-bold text-foreground">0</p>
                            <p className="text-sm text-muted-foreground">Following</p>
                        </div>
                        <div className="rounded-lg bg-background p-4 text-center">
                            <p className="text-2xl font-bold text-foreground">0</p>
                            <p className="text-sm text-muted-foreground">Likes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
