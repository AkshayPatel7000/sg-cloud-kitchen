"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Trash2,
  Terminal,
  User,
  Globe,
  Clock,
  Smartphone,
  AlertTriangle,
  FileCode,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ErrorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLog() {
      if (!id) return;
      try {
        const docRef = doc(db, "error_logs", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setLog({
            id: docSnap.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        } else {
          toast({
            title: "Not Found",
            description: "Error log not found",
            variant: "destructive",
          });
          router.push("/admin/errors");
        }
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
      await deleteDoc(doc(db, "error_logs", id as string));
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
    return <div className="p-20 text-center">Loading details...</div>;
  }

  if (!log) return null;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>
        <Button variant="destructive" size="sm" onClick={deleteLog}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Log
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Main Error Card */}
        <Card className="border-l-4 border-l-destructive shadow-lg">
          <CardHeader className="bg-destructive/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <Badge variant="destructive">ERROR</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1 ml-auto">
                <Clock className="h-3 w-3" />
                {format(log.timestamp, "PPPP pppp")}
              </span>
            </div>
            <CardTitle className="text-xl md:text-2xl font-mono break-words leading-relaxed selection:bg-destructive/20 select-all">
              {log.message}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    User ID
                  </p>
                  <p className="font-mono text-sm">
                    {log.userId || "anonymous"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded-lg">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="w-full overflow-hidden">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Page URL
                  </p>
                  <p className="text-sm break-all text-primary font-medium">
                    {log.url}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded-lg">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    User Agent
                  </p>
                  <p className="text-xs leading-relaxed max-w-sm">
                    {log.userAgent}
                  </p>
                </div>
              </div>

              {log.additionalInfo &&
                Object.keys(log.additionalInfo).length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Additional Context
                      </p>
                      <div className="mt-1 space-y-1">
                        {Object.entries(log.additionalInfo).map(
                          ([key, val]) => (
                            <div key={key} className="flex gap-2 text-xs">
                              <span className="font-bold text-muted-foreground">
                                {key}:
                              </span>
                              <span className="break-all">{String(val)}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Stack Trace */}
        {log.stack && (
          <Card className="overflow-hidden bg-[#1e1e1e] text-zinc-300">
            <CardHeader className="bg-white/[0.03] border-b border-white/5 py-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Stack Trace
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed whitespace-pre selection:bg-primary/30">
                <code>{log.stack}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
