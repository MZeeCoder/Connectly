"use client";
import Verifyotp from "./_lib/verify-otp-form";
import { useParams } from "next/navigation";

export default function Verifyotp() {
    // check in the params what their have the the code or not
    const params = useParams();
    const code = params?.code;

    return (
        <>
            <Verifyotp code={code} />
        </>
    )
}