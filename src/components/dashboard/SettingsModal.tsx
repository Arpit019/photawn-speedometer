import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink, Settings } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetId: string;
  onSheetIdChange: (id: string) => void;
  onConnect: (sheetId: string) => void;
}

export const SettingsModal = ({ 
  isOpen, 
  onClose, 
  sheetId, 
  onSheetIdChange, 
  onConnect 
}: SettingsModalProps) => {
  const [localSheetId, setLocalSheetId] = useState(sheetId);

  const handleConnect = () => {
    onSheetIdChange(localSheetId);
    onConnect(localSheetId);
    onClose();
  };

  const setupChecklist = [
    "Sheet must be shared as 'Anyone with the link can view'",
    "Tab name must be exactly: speed_metric_data",
    "All timestamp columns must have valid date/time data",
    "Required columns: Darkstore Name, Brand Name, Created Date, Import Date, Assigned At, Confirmed At, Printed At, Manifest At"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-card-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            <span>Google Sheets Configuration</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your Google Sheets connection for real-time dashboard updates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sheetId" className="text-sm font-medium">
              Google Sheet ID
            </Label>
            <Input
              id="sheetId"
              value={localSheetId}
              onChange={(e) => setLocalSheetId(e.target.value)}
              placeholder="Enter your Google Sheet ID"
              className="bg-background border-card-border"
            />
            <p className="text-xs text-muted-foreground">
              Extract the Sheet ID from your Google Sheets URL between '/d/' and '/edit'
            </p>
          </div>

          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Setup Checklist</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {setupChecklist.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-lg text-warning">
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                If you're having trouble connecting, check our setup guide for detailed instructions.
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-warning/20 hover:bg-warning/10"
              >
                <a 
                  href="https://github.com/yourusername/photawn-dashboard/blob/main/docs/setup.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Setup Guide
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-card-border hover:bg-accent/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Connect & Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};