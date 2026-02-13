"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Trash2,
  ArrowLeft,
  Terminal,
  User,
  Globe,
  Clock,
  Smartphone,
  FileCode,
  Info,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { ErrorLog } from "@/lib/error-logger";

export default function ErrorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [log, setLog] = useState<ErrorLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLog() {
      if (!id) return;
      try {
        const response = await fetch(`/api/errors/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "Not Found",
              description: "Error log not found",
              variant: "destructive",
            });
            router.push("/admin/errors");
            return;
          }
          throw new Error("Failed to fetch log");
        }
        const data = await response.json();
        setLog(data);
      } catch (error) {
        console.error("Error fetching detail:", error);
        toast({
          title: "Error",
          description: "Failed to load log details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLog();
  }, [id, router, toast]);

  const deleteLog = async () => {
    if (!confirm("Are you sure?")) return;
    try {
      const response = await fetch(`/api/errors/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete log");

      toast({
        title: "Success",
        description: "Log deleted",
      });
      router.push("/admin/errors");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete log",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Clock className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Loading details...</p>
      </div>
    );
  }

  if (!log) return null;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/errors">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold truncate flex-1">Error Details</h1>
        <Button variant="destructive" size="sm" onClick={deleteLog}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Log
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Error Info */}
        <Card className="md:col-span-2 border-destructive/20">
          <CardHeader className="bg-destructive/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="destructive" className="mb-2">
                  ERROR
                </Badge>
                <CardTitle className="text-xl text-destructive break-words">
                  {log.message}
                </CardTitle>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Terminal className="h-4 w-4" /> Stack Trace
              </h3>
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                  {log.stack || "No stack trace available"}
                </pre>
              </div>
            </div>

            {log.additionalInfo &&
              Object.keys(log.additionalInfo).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" /> Additional Context
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(log.additionalInfo, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" /> Occurrence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Date & Time
                </p>
                <p className="text-sm font-medium">
                  {log.createdAt
                    ? format(new Date(log.createdAt), "PPP")
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {log.createdAt
                    ? format(new Date(log.createdAt), "pp")
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  User ID
                </p>
                <p className="text-sm font-mono truncate" title={log.userId}>
                  {log.userId || "anonymous"}
                </p>
              </div>
              {log.additionalInfo?.userName && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Name
                  </p>
                  <p className="text-sm">{log.additionalInfo.userName}</p>
                </div>
              )}
              {log.additionalInfo?.userPhone && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Phone
                  </p>
                  <p className="text-sm">{log.additionalInfo.userPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" /> Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                  <FileCode className="h-3 w-3" /> Page URL
                </p>
                <p className="text-sm break-all text-primary underline decoration-primary/30">
                  {log.url}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> User Agent
                </p>
                <p className="text-xs text-muted-foreground break-words leading-relaxed">
                  {log.userAgent}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
