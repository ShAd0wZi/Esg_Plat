"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function AuthPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

    const handleSignUp = async () => {
        setLoading(true);
        setStatus(null);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error("Sign Up Error:", error);
            setStatus({ type: "error", message: error.message });
            setLoading(false);
        } else {
            setStatus({ type: "success", message: "Account created. Redirecting to onboarding..." });
            router.push("/onboarding"); // Send them to create company profile
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        setStatus(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Sign In Error:", error);
            setStatus({ type: "error", message: "Login failed: " + error.message });
            setLoading(false);
        } else {
            router.push("/dashboard"); // If they already have an account, go to dash
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
            <Card className="w-full max-w-sm border-border/60 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-serif text-2xl text-foreground">Welcome</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account or login.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {status && (
                        <div
                            className={`rounded-md border px-3 py-2 text-sm ${status.type === "error"
                                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                                    : "border-primary/30 bg-primary/10 text-primary"
                                }`}
                        >
                            {status.message}
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" onClick={handleSignIn} disabled={loading}>
                        {loading ? "Loading..." : "Sign In"}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
                        Sign Up
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}