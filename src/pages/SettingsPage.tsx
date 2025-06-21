import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const BILLING_DATE_KEY = "billing_date";

export default function SettingsPage() {
  const [billingDate, setBillingDate] = useState<string>("");

  useEffect(() => {
    // Load saved billing date from localStorage
    const savedDate = localStorage.getItem(BILLING_DATE_KEY);
    if (savedDate) {
      setBillingDate(savedDate);
    } else {
      // Default to the 1st of the month
      setBillingDate("1");
    }
  }, []);

  const handleBillingDateChange = (value: string) => {
    setBillingDate(value);
    localStorage.setItem(BILLING_DATE_KEY, value);
    toast.success("Billing date updated successfully");
  };

  // Generate options for days 1-28 (to avoid issues with months that have fewer days)
  const dayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Claude Code Tracker preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Billing Cycle</CardTitle>
            <CardDescription>
              Set when your monthly usage resets based on your Claude subscription billing date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billing-date">Monthly reset day</Label>
                <Select value={billingDate} onValueChange={handleBillingDateChange}>
                  <SelectTrigger id="billing-date" className="w-[240px]">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Your usage metrics will reset on the {billingDate}{billingDate === '1' ? 'st' : billingDate === '2' ? 'nd' : billingDate === '3' ? 'rd' : 'th'} of each month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              More settings coming soon...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Plan selection and usage limits configuration will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}