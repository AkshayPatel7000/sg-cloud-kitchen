"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Trash2,
  Eye,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { ErrorLog } from "@/lib/error-logger";

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/errors");
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error",
        description: "Failed to load error logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [toast]);

  const deleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      const response = await fetch(`/api/errors/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete log");

      setLogs(logs.filter((l) => l.id !== id));
      toast({
        title: "Success",
        description: "Log deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting log:", error);
      toast({
        title: "Error",
        description: "Failed to delete log",
        variant: "destructive",
      });
    }
  };

  const clearAllLogs = async () => {
    if (
      !confirm(
        "Are you sure you want to clear ALL logs? This cannot be undone.",
      )
    )
      return;
    try {
      const response = await fetch("/api/errors", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear logs");

      setLogs([]);
      toast({
        title: "Success",
        description: "All logs cleared",
      });
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast({
        title: "Error",
        description: "Failed to clear logs",
        variant: "destructive",
      });
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.additionalInfo?.userName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      log.additionalInfo?.userPhone?.includes(searchTerm) ||
      log.userId?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <AlertCircle className="text-destructive h-8 w-8" />
            Error Logs
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage application errors
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearAllLogs}
            disabled={loading || logs.length === 0}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search errors by message, User, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && logs.length === 0 ? (
            <div className="py-20 text-center">
              <RefreshCcw className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-muted-foreground">Loading logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <p className="mt-2 text-muted-foreground">No error logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground font-medium">
                    <th className="pb-3 pl-2">Time</th>
                    <th className="pb-3">Message</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 pl-2 whitespace-nowrap text-muted-foreground">
                        {log.createdAt
                          ? format(new Date(log.createdAt), "MMM d, HH:mm:ss")
                          : "N/A"}
                      </td>
                      <td className="py-3 max-w-md">
                        <p
                          className="font-semibold truncate text-destructive"
                          title={log.message}
                        >
                          {log.message}
                        </p>
                      </td>
                      <td className="py-3 italic">
                        {log.additionalInfo?.userName ||
                          log.userId ||
                          "anonymous"}
                      </td>
                      <td className="py-3">
                        {log.additionalInfo?.userPhone || "-"}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/errors/${log.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => log.id && deleteLog(log.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
