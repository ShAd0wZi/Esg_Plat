"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateTotalEmissions, calculateItemImpact, Metric } from "@/lib/esg-utils";

export default function ReportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState("");
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [totalCO2, setTotalCO2] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) console.error("Auth Error:", userError);
            if (!user) { router.push("/auth"); return; }

            // Get Company Name
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .select('company_name')
                .eq('user_id', user.id)
                .single();

            if (companyError && companyError.code !== 'PGRST116') {
                 console.error("Company Fetch Error:", companyError);
            }

            if (isMounted && companyData) setCompanyName(companyData.company_name);

            // Get Metrics
            const { data: metricsData, error: metricsError } = await supabase
                .from('metrics')
                .select('*')
                .eq('user_id', user.id);

            if (metricsError) console.error("Metrics Fetch Error:", metricsError);

            if (isMounted && metricsData) {
                setMetrics(metricsData);
                // Calculate Total CO2 using shared logic
                setTotalCO2(calculateTotalEmissions(metricsData));
            }
            if (isMounted) setLoading(false);
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const generatePDF = () => {
        const doc = new jsPDF();

        // 1. Header (Buyer-facing PDF)
        doc.setFontSize(22);
        doc.text(companyName, 14, 22);
        doc.setFontSize(12);
        doc.text("Buyer ESG Report", 14, 32);
        doc.line(14, 35, 196, 35); // Horizontal line

        // 2. Summary
        doc.setFontSize(14);
        doc.text(`Total Estimated Emissions: ${totalCO2.toFixed(2)} Tons CO2e`, 14, 45);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 52);

        // 3. The Table
        const tableData = metrics.map(m => [
            m.date_logged,
            m.category.toUpperCase(),
            m.description || "",
            `${m.amount} ${m.unit}`,
            `${calculateItemImpact(m).toFixed(2)} kg CO2`
        ]);

        autoTable(doc, {
            head: [['Date', 'Category', 'Description', 'Input', 'Est. Impact']],
            body: tableData,
            startY: 60,
        });

        // 4. Footer & Disclaimer
        doc.setFontSize(8);
        const disclaimer = "DISCLAIMER: This report is based on data provided by the user. [Your App Name] does not verify the accuracy of the data and this report does not constitute a certified audit or legal advice. Use at your own risk.";

        // Split text to fit page width
        const splitDisclaimer = doc.splitTextToSize(disclaimer, 180);
        doc.text(splitDisclaimer, 14, 275);

        // 5. Save (buyer-facing filename)
        doc.save(`${companyName.replace(/\s+/g, '_')}_Buyer_ESG_Report.pdf`);
    };

    const generateCSV = () => {
        // CSV for suppliers: labelled as Supplier ESG Questionnaire
        const headerTitle = "Supplier ESG Questionnaire";
        const headers = ["Date", "Category", "Description", "Input", "Est. Impact (kg CO2)"];

        const rows = metrics.map(m => [
            m.date_logged,
            m.category,
            m.description || "",
            `${m.amount} ${m.unit}`,
            `${calculateItemImpact(m).toFixed(2)}`
        ]);

        let csvContent = '';
        csvContent += headerTitle + "\n\n"; // Clear wording row
        csvContent += headers.join(',') + "\n";
        rows.forEach(r => {
            // Escape any quotes
            const line = r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
            csvContent += line + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `${companyName.replace(/\s+/g, '_')}_Supplier_ESG_Questionnaire.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-10 text-muted-foreground">
                Calculating emissions...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="font-serif text-2xl font-bold text-foreground">Buyer ESG Report</h1>
                </div>

                <Card className="mb-8 border-border/60 bg-card/70 shadow-md backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-muted-foreground">Total Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-serif text-4xl font-extrabold text-foreground">
                            {totalCO2.toFixed(3)} <span className="font-sans text-xl font-normal text-muted-foreground">Tons CO2e</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Based on {metrics.length} data entries.
                        </p>
                    </CardContent>
                </Card>

                <div className="flex flex-col justify-end gap-3 sm:flex-row">
                    <Button size="lg" variant="outline" onClick={generateCSV}>
                        Export Supplier ESG Questionnaire (CSV)
                    </Button>
                    <Button size="lg" onClick={generatePDF}>
                        <Download className="mr-2 h-4 w-4" /> Download Buyer ESG Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
