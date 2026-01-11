"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FiLock } from "react-icons/fi";
import { VerifyAccountAction, ResendOTPAction } from "@/server/actions/auth.actions";

export default function Verifyotp({ code }: { code: string }) {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    // Auto-verify when all fields are filled
    useEffect(() => {
        const otpString = otp.join("");
        if (otpString.length === 6 && !isVerifying) {
            handleVerify(otpString);
        }
    }, [otp]);

    const handleVerify = async (otpString: string) => {
        if (!email) {
            setError("Email not found. Please sign up again.");
            return;
        }

        setIsVerifying(true);
        setError("");
        setSuccessMessage("");

        try {
            const result = await VerifyAccountAction(otpString, email);

            if (result.success && result.data) {
                setSuccessMessage(result.message || "Account verified successfully!");
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    router.push(result.data!.redirectTo);
                }, 1500);
            } else {
                setError(result.error || "Invalid code. Please try again.");
                // Clear OTP on error
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error(err);
            // Clear OTP on error
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();

        // Check if pasted data is 6 digits
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split("");
            setOtp(newOtp);
            setError("");
            // Focus last input
            inputRefs.current[5]?.focus();
        }
    };

    const handleResendCode = async () => {
        if (!email) {
            setError("Email not found. Please sign up again.");
            return;
        }

        setError("");
        setSuccessMessage("");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setIsResending(true);

        try {
            const result = await ResendOTPAction(email);

            if (result.success) {
                setSuccessMessage(result.message || "A new verification code has been sent to your email.");
            } else {
                setError(result.error || "Failed to resend code. Please try again.");
            }
        } catch (err) {
            setError("Failed to resend code. Please try again.");
            console.error(err);
        } finally {
            setIsResending(false);
        }
    };

    const handleManualVerify = () => {
        const otpString = otp.join("");
        if (otpString.length === 6) {
            handleVerify(otpString);
        }
    };

    return (
        <div className="flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg animate-[slideDown_0.5s_ease-out]">
                {/* Lock Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray rounded-full flex items-center justify-center text-white text-2xl">
                        <FiLock />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white">
                        Verify Your Account
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Enter the 6-digit code sent to{" "}
                        {email ? (
                            <span className="text-white font-medium">{email}</span>
                        ) : (
                            "your email"
                        )}
                        . This code is valid for the next 10 minutes.
                    </p>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-12 h-12 text-center text-white text-lg font-semibold bg-black border-2 border-gray rounded-md focus:border-primary focus:outline-none hover:border-primary/50 transition-colors"
                            disabled={isVerifying}
                        />
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <p className="text-red-500 text-sm text-center animate-[shake_0.3s_ease-in-out]">
                        {error}
                    </p>
                )}

                {/* Success Message */}
                {successMessage && (
                    <p className="text-green-500 text-sm text-center animate-[fadeIn_0.3s_ease-in-out]">
                        {successMessage}
                    </p>
                )}

                {/* Verify Button */}
                <Button
                    onClick={handleManualVerify}
                    isLoading={isVerifying}
                    disabled={otp.join("").length !== 6}
                    className="w-full bg-primary hover:bg-primary/80 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiLock className="inline mr-2" />
                    Verify Account
                </Button>

                {/* Resend Code */}
                <div className="text-center text-sm">
                    <span className="text-gray-400">Didn't get the code? </span>
                    <button
                        onClick={handleResendCode}
                        className="text-white hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isVerifying || isResending}
                    >
                        {isResending ? "Sending..." : "Resend code"}
                    </button>
                </div>

                {/* Footer Links */}
                <div className="flex justify-center gap-4 text-sm text-gray-500 pt-4">
                    <button className="hover:text-white transition-colors">
                        Need help?
                    </button>
                    <span>•</span>
                    <button className="hover:text-white transition-colors">
                        Send feedback
                    </button>
                </div>
            </div>
        </div>
    );
}