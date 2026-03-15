"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function Onboarding() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

    // Form State
    const [companyName, setCompanyName] = useState("");
    const [country, setCountry] = useState("");
    const [industry, setIndustry] = useState("");
    const [employees, setEmployees] = useState("");
    const [reportingYear, setReportingYear] = useState(new Date().getFullYear().toString());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        // 1. Get the current logged in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Auth Error:", userError);
            setStatus({ type: "error", message: "You must be logged in." });
            setLoading(false);
            return;
        }

        // 2. Insert data into Supabase
        const { error } = await supabase
            .from('companies')
            .insert([
                {
                    user_id: user.id,
                    company_name: companyName,
                    country: country,
                    industry: industry,
                    employee_count: parseInt(employees),
                    reporting_year: parseInt(reportingYear)
                }
            ]);

        if (error) {
            console.error("Insert Error:", error);
            setStatus({ type: "error", message: "Error saving profile: " + error.message });
            setLoading(false);
        } else {
            setStatus({ type: "success", message: "Company profile created. Redirecting..." });
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-border/60 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-serif text-foreground">Create Company Profile</CardTitle>
                    <CardDescription>Tell us about your organization to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <div className="space-y-2">
                            <Label htmlFor="name">Company Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Acme Solar"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                placeholder="e.g. Sri Lanka"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry Sector</Label>
                            <Input
                                id="industry"
                                placeholder="e.g. Manufacturing"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employees">Employee Count</Label>
                            <Input
                                id="employees"
                                type="number"
                                placeholder="e.g. 50"
                                value={employees}
                                onChange={(e) => setEmployees(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">Reporting Year</Label>
                            <Input
                                id="year"
                                type="number"
                                placeholder="e.g. 2024"
                                value={reportingYear}
                                onChange={(e) => setReportingYear(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Saving..." : "Create Profile"}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}