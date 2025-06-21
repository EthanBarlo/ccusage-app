import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ThemeMode } from "@/types/theme-mode";
import { getCurrentTheme, setTheme } from "@/helpers/theme_helpers";
import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";

const BILLING_DATE_KEY = "billing_date";
const CUSTOM_CCUSAGE_COMMAND_KEY = "custom_ccusage_command";

export default function SettingsPage() {
  const [billingDate, setBillingDate] = useState<string>("");
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("system");
  const [customCommand, setCustomCommand] = useState<string>("");

  useEffect(() => {
    // Load saved billing date from localStorage
    const savedDate = localStorage.getItem(BILLING_DATE_KEY);
    if (savedDate) {
      setBillingDate(savedDate);
    } else {
      // Default to the 1st of the month
      setBillingDate("1");
    }

    // Load saved custom command
    const savedCommand = localStorage.getItem(CUSTOM_CCUSAGE_COMMAND_KEY);
    if (savedCommand) {
      setCustomCommand(savedCommand);
      // Sync with main process on startup
      window.settingsApi.setSetting(CUSTOM_CCUSAGE_COMMAND_KEY, savedCommand);
    }

    // Load current theme
    const loadTheme = async () => {
      const { local } = await getCurrentTheme();
      setCurrentTheme(local || "system");
    };
    loadTheme();
  }, []);

  const handleBillingDateChange = (value: string) => {
    setBillingDate(value);
    localStorage.setItem(BILLING_DATE_KEY, value);
    toast.success("Billing date updated successfully");
  };

  const handleThemeChange = async (value: ThemeMode) => {
    setCurrentTheme(value);
    await setTheme(value);
    toast.success(`Theme changed to ${value}`);
  };

  const handleCustomCommandChange = async (value: string) => {
    setCustomCommand(value);
    if (value.trim()) {
      localStorage.setItem(CUSTOM_CCUSAGE_COMMAND_KEY, value);
      // Also sync with main process
      await window.settingsApi.setSetting(CUSTOM_CCUSAGE_COMMAND_KEY, value);
    } else {
      localStorage.removeItem(CUSTOM_CCUSAGE_COMMAND_KEY);
      // Also sync with main process
      await window.settingsApi.setSetting(CUSTOM_CCUSAGE_COMMAND_KEY, null);
    }
    toast.success("Custom command updated successfully");
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
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how Claude Code Tracker looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={currentTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme" className="w-[240px]">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <IconSun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <IconMoon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <IconDeviceDesktop className="h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select your preferred theme or use your system settings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
            <CardTitle>Advanced</CardTitle>
            <CardDescription>
              Configure advanced settings for power users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-command">Custom ccusage command</Label>
                <Input
                  id="custom-command"
                  type="text"
                  placeholder="npx ccusage@latest"
                  value={customCommand}
                  onChange={(e) => handleCustomCommandChange(e.target.value)}
                  className="max-w-md"
                />
                <p className="text-sm text-muted-foreground">
                  Override the default command used to run ccusage. Leave empty to use the default "npx ccusage@latest".
                  Examples: "npx ccusage", "/usr/local/bin/ccusage", "~/.local/bin/ccusage"
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