import { BsExclamationTriangle } from "react-icons/bs";
import { HiOutlineCheckCircle } from "react-icons/hi";

interface AlertMessageProps {
    type: "error" | "success";
    title: string;
    description?: string;
}

export default function AlertMessage({ type, title, description }: AlertMessageProps) {
    const isError = type === "error";

    const styles = {
        container: isError
            ? "border-destructive text-destructive"
            : "border-primary text-primary",
        icon: isError ? "text-destructive" : "text-primary",
    };

    const Icon = isError ? BsExclamationTriangle : HiOutlineCheckCircle;

    return (
        <div className={`border-2 ${styles.container} bg-transparent rounded-lg p-3 flex items-start gap-2.5`}>
            <Icon className={`${styles.icon} text-xl mt-0.5 shrink-0`} />
            <div className="flex-1">
                <p className="font-semibold text-sm leading-tight">{title}</p>
                {description && (
                    <p className="text-xs mt-1 opacity-90 leading-snug">{description}</p>
                )}
            </div>
        </div>
    );
}
