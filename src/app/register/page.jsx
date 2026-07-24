// client/src/app/(auth)/register/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import {
    Button,
    Card,
    FieldError,
    Form,
    Input,
    Label,
    TextField,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { GrGoogle } from "react-icons/gr";
import { MdEmail, MdLock, MdPerson, MdPhone, MdCloudUpload, MdClose, MdCalendarToday } from "react-icons/md";

export default function SignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageUrl, setImageUrl] = useState("");
    const fileInputRef = useRef(null);
    const [dob, setDob] = useState("");

    const uploadImageToImgBB = async (file) => {
        const API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        if (!API_KEY) throw new Error('ImgBB API key is not configured');
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
                method: 'POST', body: formData
            });
            const data = await response.json();
            if (data.success) return data.data.url;
            else throw new Error(data.error?.message || 'Image upload failed');
        } catch (error) {
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) { toast.error('Only JPEG, JPG, PNG, WEBP, and GIF are allowed.'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be less than 5MB.'); return; }
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        setSelectedImage(file);
        setImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null); setSelectedImage(null); setImageUrl("");
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        const formData = new FormData(e.target);
        const name = formData.get("name");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const password = formData.get("password");

        if (!name || !email || !phone || !password || !dob) {
            toast.error("Please fill in all required fields");
            setIsLoading(false); return;
        }

        const loadingToast = toast.loading("Creating your account...");

        try {
            let finalImageUrl = imageUrl;
            if (selectedImage) {
                setUploading(true); setUploadProgress(0);
                try {
                    finalImageUrl = await uploadImageToImgBB(selectedImage);
                    setUploadProgress(100);
                } catch (uploadError) {
                    toast.dismiss(loadingToast);
                    toast.error(`Image upload failed: ${uploadError.message}`);
                    setIsLoading(false); setUploading(false); return;
                }
                setUploading(false);
            }

            const result = await authClient.signUp.email({
                name, email, password, phone,
                dateOfBirth: dob,
                image: finalImageUrl || undefined,
                role: "member",
                // isManager auto-set by Better Auth default → false
            });

            if (result.error) {
                toast.dismiss(loadingToast);
                if (result.error.message?.includes("already")) {
                    toast.error("This email is already registered. Try signing in instead.");
                } else {
                    toast.error(result.error.message || "Signup failed.");
                }
                setIsLoading(false); return;
            }

            toast.dismiss(loadingToast);
            toast.success("Account created successfully!");
            setTimeout(() => router.push("/"), 1200);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await authClient.signIn.social({ provider: "google", callbackURL: "/" });
        } catch (err) {
            toast.error("Google sign-in failed. Try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50/70 px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-emerald-100/80 backdrop-blur-sm text-emerald-700 px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
                        <span className="text-lg">✨</span>
                        <span>Join ProjectHimaloy</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
                    <p className="text-gray-500 mt-3 text-sm">
                        Start your journey with us today
                    </p>
                </div>

                {/* Card */}
                <Card className="w-full border-0 shadow-2xl shadow-emerald-100/50 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                    <div className="p-7 md:p-8">
                        <Form className="flex flex-col gap-5" onSubmit={onSubmit}>
                            {/* Profile Image Upload */}
                            <div className="flex flex-col items-center gap-3 pb-2">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative cursor-pointer transition-all duration-300 ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                        }`}
                                >
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-28 h-28 rounded-full object-cover border-4 border-emerald-400 shadow-lg shadow-emerald-200/50"
                                            />
                                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-medium">Change</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-all hover:scale-110 shadow-md"
                                            >
                                                <MdClose size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex flex-col items-center justify-center border-3 border-dashed border-emerald-300 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200/50 group">
                                            <MdCloudUpload className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] text-emerald-500 font-medium mt-1">Upload</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 font-medium">
                                    {imagePreview ? 'Profile photo' : 'Upload profile photo (optional)'}
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={uploading || isLoading}
                                />
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <TextField isRequired name="name" type="text">
                                    <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                                    <div className="relative">
                                        <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <Input
                                            placeholder="Enter your full name"
                                            className="pl-10 h-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <FieldError />
                                </TextField>

                                <TextField isRequired name="email" type="email"
                                    validate={(value) => !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ? "Please enter a valid email address" : null}>
                                    <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                                    <div className="relative">
                                        <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <Input
                                            placeholder="example@email.com"
                                            className="pl-10 h-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <FieldError />
                                </TextField>

                                <TextField isRequired name="phone" type="tel">
                                    <Label className="text-sm font-semibold text-gray-700">Phone Number</Label>
                                    <div className="relative">
                                        <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <Input
                                            placeholder="017XXXXXXXX"
                                            className="pl-10 h-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <FieldError />
                                </TextField>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-sm font-semibold text-gray-700">Date of Birth</Label>
                                    <div className="relative">
                                        <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 z-10" size={18} />
                                        <input
                                            type="date"
                                            name="dob"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            className="w-full pl-10 pr-4 h-12 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-gray-700 bg-white"
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                </div>

                                <TextField isRequired minLength={6} name="password" type="password"
                                    validate={(value) => value.length < 6 ? "Password must be at least 6 characters" : null}>
                                    <Label className="text-sm font-semibold text-gray-700">Password</Label>
                                    <div className="relative">
                                        <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <Input
                                            placeholder="Min 6 characters"
                                            className="pl-10 h-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <FieldError />
                                </TextField>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/70 hover:scale-[1.02] active:scale-[0.98] mt-2"
                                disabled={isLoading || uploading}
                            >
                                {isLoading || uploading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </Form>

                        {/* Divider */}
                        <div className="relative my-7">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-400 font-medium">or continue with</span>
                            </div>
                        </div>

                        {/* Google Button */}
                        <Button
                            onClick={handleGoogleSignIn}
                            className="w-full border-2 border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 h-12 rounded-xl"
                            disabled={isLoading}
                        >
                            <GrGoogle className="text-xl" />
                            {isLoading ? "Loading..." : "Sign Up with Google"}
                        </Button>

                        {/* Footer */}
                        <p className="text-center text-sm text-gray-600 mt-6">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </Card>

                {/* Decorative Elements */}
                <div className="fixed top-20 left-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
                <div className="fixed bottom-20 right-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl -z-10"></div>
            </div>
        </div>
    );
}