import { ProfileContent } from "@/components/profile/profile-content";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
    return (
        <div className="mx-auto h-full px-2 sm:px-4 py-4 sm:py-8">
            <ProfileContent />
        </div>
    );
}
