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
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        <span>💰</span><span>Welcome to ProjectHimaloy</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Create Account</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-700 mx-auto rounded-full"></div>
                    <p className="text-gray-500 mt-4">Join as a member</p>
                </div>

                <div className="flex justify-center items-center">
                    <Card className="w-full max-w-md border border-blue-100 shadow-xl">
                        <div className="p-6 md:p-8">
                            <Form className="flex flex-col gap-5" onSubmit={onSubmit}>
                                <div className="flex flex-col items-center gap-2">
                                    <div onClick={() => fileInputRef.current?.click()}
                                        className={`cursor-pointer transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img src={imagePreview} alt="Preview"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-400 shadow-lg" />
                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">
                                                    <MdClose size={14} /></button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
                                                <MdCloudUpload className="w-8 h-8 text-blue-400" /></div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">Upload profile photo (optional)</p>
                                    <input ref={fileInputRef} type="file" accept="image/*"
                                        onChange={handleImageSelect} className="hidden" disabled={uploading || isLoading} />
                                </div>

                                <TextField isRequired name="name" type="text">
                                    <Label>Full Name</Label>
                                    <div className="relative"><MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <Input placeholder="Enter your full name" className="pl-10" disabled={isLoading} /></div>
                                    <FieldError /></TextField>

                                <TextField isRequired name="email" type="email"
                                    validate={(value) => !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ? "Please enter a valid email address" : null}>
                                    <Label>Email</Label>
                                    <div className="relative"><MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <Input placeholder="example@email.com" className="pl-10" disabled={isLoading} /></div>
                                    <FieldError /></TextField>

                                <TextField isRequired name="phone" type="tel">
                                    <Label>Phone Number</Label>
                                    <div className="relative"><MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <Input placeholder="017XXXXXXXX" className="pl-10" disabled={isLoading} /></div>
                                    <FieldError /></TextField>

                                <div className="flex flex-col gap-2">
                                    <Label>Date of Birth</Label>
                                    <div className="relative"><MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                                        <input type="date" name="dob" value={dob} onChange={(e) => setDob(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                                            disabled={isLoading} required /></div>
                                </div>

                                <TextField isRequired minLength={6} name="password" type="password"
                                    validate={(value) => value.length < 6 ? "Password must be at least 6 characters" : null}>
                                    <Label>Password</Label>
                                    <div className="relative"><MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <Input placeholder="Min 6 characters" className="pl-10" disabled={isLoading} /></div>
                                    <FieldError /></TextField>

                                <Button type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-200 h-12 mt-2"
                                    disabled={isLoading || uploading}>
                                    {isLoading || uploading ? "Creating..." : "Create Account"}</Button>
                            </Form>

                            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Or continue with</span></div></div>

                            <Button onClick={handleGoogleSignIn}
                                className="w-full border-2 border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all h-12" disabled={isLoading}>
                                <GrGoogle className="text-red-500" />{isLoading ? "Loading..." : "Sign Up with Google"}</Button>

                            <p className="text-center text-sm text-gray-600 mt-6">
                                Already have an account?{' '}
                                <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">Sign In</Link></p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
