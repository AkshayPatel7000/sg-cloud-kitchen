"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Trash2,
  Eye,
  RefreshCcw,
  Search,
  Filter,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const logsRef = collection(db, "error_logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        setLogs(fetchedLogs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching logs:", error);
        toast({
          title: "Error",
          description: "Failed to load error logs",
          variant: "destructive",
        });
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [toast]);

  const deleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      await deleteDoc(doc(db, "error_logs", id));
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
      const snapshot = await getDocs(collection(db, "error_logs"));
      const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
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
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Error Logs</h1>
          <p className="text-muted-foreground">
            Monitor and debug application errors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLoading(true)}>
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={clearAllLogs}>
            <XCircle className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by message, customer, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                    <th className="pb-3">Error Message</th>
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
                        {format(log.timestamp, "MMM d, HH:mm:ss")}
                      </td>
                      <td className="py-3 max-w-md">
                        <p
                          className="font-semibold truncate text-destructive"
                          title={log.message}
                        >
                          {log.message}
                        </p>
                      </td>
                      <td className="py-3 font-medium">
                        {log.additionalInfo?.userName || (
                          <span className="text-muted-foreground italic text-[10px]">
                            {log.userId === "anonymous" ? "Guest" : log.userId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-mono">
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
                            onClick={() => deleteLog(log.id)}
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
