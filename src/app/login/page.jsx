// client/src/app/(auth)/login/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { Check } from "@gravity-ui/icons";
import "animate.css";
import {
    Button,
    Card,
    Description,
    FieldError,
    Form,
    Input,
    Label,
    TextField,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MdEmail, MdLock } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FiEyeOff } from "react-icons/fi";
import { BsEye } from "react-icons/bs";
import toast from "react-hot-toast";

export default function SignInPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPass, setShowPass] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const email = e.target.email.value;
        const password = e.target.password.value;

        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/",
        });

        if (error) {
            setErrorMsg("Invalid email or password. Please try again.");
            setLoading(false);
            return;
        }

        toast.success("Logged in successfully!");

        setTimeout(() => {
            router.push("/");
        }, 1200);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
            });
        } catch (error) {
            console.error("Google sign-in error:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 animate__animated animate__backInDown">

            <Card className="w-full max-w-md p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
                        🔐 Welcome Back
                    </div>

                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        Sign In
                    </h1>

                    <p className="text-gray-500 text-sm mt-2">
                        Access your ProjectHimaloy account
                    </p>
                </div>

                {/* Error */}
                {errorMsg && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Form */}
                <Form onSubmit={onSubmit} className="flex flex-col gap-4">

                    {/* Email */}
                    <TextField isRequired name="email" type="email">
                        <Label className="text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </Label>

                        <div className="relative">
                            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />

                            <Input
                                placeholder="john@example.com"
                                className="h-12 w-full pl-10 pr-3 rounded-xl border border-gray-200 bg-white
                                transition-all duration-200
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                hover:border-gray-300"
                            />
                        </div>

                        <FieldError />
                    </TextField>

                    {/* Password */}
                    <TextField isRequired name="password">
                        <Label className="text-sm font-medium text-gray-700 mb-1">
                            Password
                        </Label>

                        <div className="relative">
                            <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />

                            <Input
                                type={showPass ? "text" : "password"}
                                placeholder="Enter your password"
                                className="h-12 w-full pl-10 pr-10 rounded-xl border border-gray-200 bg-white
                                transition-all duration-200
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                hover:border-gray-300"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPass ? <FiEyeOff size={18} /> : <BsEye size={18} />}
                            </button>
                        </div>

                        <Description className="text-xs text-gray-400 mt-1">
                            Minimum 6 characters
                        </Description>

                        <FieldError />
                    </TextField>

                    {/* Forgot */}
                    <div className="text-right">
                        <Link
                            href="/forgot-password"
                            className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">

                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 
                            text-white font-semibold
                            hover:scale-[1.02] active:scale-[0.98]
                            transition-all duration-200 shadow-md shadow-blue-200"
                        >
                            {loading ? "Signing in..." : (
                                <>
                                    <Check size={18} />
                                    Sign In
                                </>
                            )}
                        </Button>

                        <Button
                            type="reset"
                            disabled={loading}
                            variant="flat"
                            className="h-12 rounded-xl"
                        >
                            Reset
                        </Button>
                    </div>
                </Form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-400">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google */}
                <Button
                    onClick={handleGoogleSignIn}
                    className="w-full border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300 h-12"
                    disabled={loading}
                >
                    <FcGoogle />
                    {loading ? "Redirecting..." : "Continue with Google"}
                </Button>

                {/* Signup */}
                <p className="text-center text-xs text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Create account
                    </Link>
                </p>

            </Card>
        </div>
    );
}