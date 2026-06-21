"use client";

import { useState } from "react";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useDelete } from "@/hooks/useDelete";
import toast from "react-hot-toast";
import {
  Mail,
  Users,
  Send,
  Trash2,
  Filter,
  Newspaper,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Inbox,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function NewsletterPage() {
  const [tab, setTab] = useState<"subscribers" | "sent" | "compose">("subscribers");
  const [filter, setFilter] = useState("all");

  const { data: subsData, isLoading: subsLoading, refetch: refetchSubs } = useGet<any>(
    ["newsletter-subscribers", filter],
    `/api/newsletter/subscribers${filter === "all" ? "" : `?status=${filter}`}`
  );

  const { data: sentData, isLoading: sentLoading, refetch: refetchSent } = useGet<any>(
    ["newsletter-sent"],
    "/api/newsletter/sent"
  );

  const deleteSub = useDelete("/api/newsletter/subscribers/:id", {
    onSuccess: (d: any) => {
      if (d.success) { toast.success(d.message); refetchSubs(); }
      else toast.error(d.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const subscribers = subsData?.subscribers || [];
  const sentNewsletters = sentData?.newsletters || [];

  const tabs = [
    { key: "subscribers" as const, label: "Subscribers", icon: Users },
    { key: "sent" as const, label: "Sent", icon: Newspaper },
    { key: "compose" as const, label: "Compose", icon: Send },
  ];

  const filters = [
    { key: "all", label: "All", icon: Filter },
    { key: "active", label: "Active", icon: CheckCircle2 },
    { key: "inactive", label: "Inactive", icon: XCircle },
  ];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="w-9 h-9 rounded-xl bg-white border border-border-light flex items-center justify-center hover:bg-surface-hover transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4 text-muted" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Newsletter</h1>
              <p className="text-xs text-muted mt-0.5">Manage subscribers and send newsletters</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-border-light p-1.5 animate-fade-in-up">
          <div className="flex gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    tab === t.key
                      ? "gradient-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subscribers Tab */}
        {tab === "subscribers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{subscribers.length} subscribers</p>
              <div className="flex gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      filter === f.key
                        ? "gradient-primary text-white shadow-sm"
                        : "bg-white border border-border-light text-muted hover:text-foreground hover:border-border"
                    }`}
                  >
                    <f.icon className="w-3 h-3" />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {subsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-border-light animate-fade-in">
                <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-muted animate-pulse">Loading subscribers...</p>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No subscribers yet</h3>
                <p className="text-sm text-muted">Subscribers will appear here once they sign up</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-border-light overflow-hidden animate-fade-in-up">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-light">
                          <th className="text-left text-xs font-medium text-muted px-5 py-3 uppercase tracking-wider">Email</th>
                          <th className="text-left text-xs font-medium text-muted px-5 py-3 uppercase tracking-wider">Name</th>
                          <th className="text-left text-xs font-medium text-muted px-5 py-3 uppercase tracking-wider">Status</th>
                          <th className="text-left text-xs font-medium text-muted px-5 py-3 uppercase tracking-wider">Subscribed</th>
                          <th className="text-left text-xs font-medium text-muted px-5 py-3 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((sub: any) => (
                          <tr key={sub._id} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <Mail className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium text-foreground">{sub.email}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-muted">{sub.name || "—"}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                                sub.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                {sub.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 text-xs text-muted">
                                <Clock className="w-3 h-3" />
                                {new Date(sub.subscribedAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => deleteSub.mutate({ id: sub._id } as any)}
                                className="w-8 h-8 rounded-lg border border-danger/30 text-danger flex items-center justify-center hover:bg-danger/5 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {subscribers.map((sub: any) => (
                    <div key={sub._id} className="bg-white rounded-2xl border border-border-light p-4 animate-fade-in-up">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{sub.email}</p>
                            <p className="text-xs text-muted truncate">{sub.name || "—"}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg shrink-0 ${
                          sub.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {sub.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Clock className="w-3 h-3" />
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => deleteSub.mutate({ id: sub._id } as any)}
                          className="flex items-center gap-1.5 text-xs text-danger hover:text-danger/80 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Sent Tab */}
        {tab === "sent" && (
          <div className="space-y-4">
            {sentLoading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-border-light animate-fade-in">
                <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-muted animate-pulse">Loading sent newsletters...</p>
              </div>
            ) : sentNewsletters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
                  <Newspaper className="w-8 h-8 text-muted" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No newsletters sent yet</h3>
                <p className="text-sm text-muted">Sent newsletters will appear here</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-border-light overflow-hidden animate-fade-in-up">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-light">
                          <th className="text-left text-xs font-medium text-muted px-5 py-3 uppercase tracking-wider">Subject</th>
                          <th className="text-left text-xs font-medium text-muted px-5 py-3 uppercase tracking-wider">Recipients</th>
                          <th className="text-left text-xs font-medium text-muted px-5 py-3 uppercase tracking-wider">Sent At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sentNewsletters.map((n: any) => (
                          <tr key={n._id} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                                  <Send className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-medium text-foreground">{n.subject}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 text-muted">
                                <Users className="w-3.5 h-3.5" />
                                <span>{n.sentTo}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 text-xs text-muted">
                                <Clock className="w-3 h-3" />
                                {new Date(n.sentAt).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {sentNewsletters.map((n: any) => (
                    <div key={n._id} className="bg-white rounded-2xl border border-border-light p-4 animate-fade-in-up">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                          <Send className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-medium text-sm text-foreground truncate">{n.subject}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border-light">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          {n.sentTo} recipients
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {new Date(n.sentAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Compose Tab */}
        {tab === "compose" && <ComposeForm refetchSent={refetchSent} />}
      </div>
    </div>
  );
}

function ComposeForm({ refetchSent }: { refetchSent: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendToAll, setSendToAll] = useState(true);

  const send = usePost("/api/newsletter/send", {
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success(d.message);
        setSubject("");
        setBody("");
        refetchSent();
      } else {
        toast.error(d.message);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      return toast.error("Subject and body are required");
    }
    send.mutate({ subject, body } as any);
  };

  return (
    <div className="max-w-3xl animate-fade-in-up">
      <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
        {/* Compose Header */}
        <div className="px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Compose Newsletter</h3>
              <p className="text-xs text-muted">Send a newsletter to all active subscribers</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none"
              placeholder="Newsletter subject"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email Body <span className="text-muted">(HTML supported)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none font-mono"
              placeholder="<h1>Hello!</h1><p>Your newsletter content here...</p>"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Sending to all active subscribers</p>
              <p className="text-xs text-muted">This newsletter will be delivered to everyone on your list</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={send.isPending}
            className="w-full gradient-primary text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer flex items-center justify-center gap-2"
          >
            {send.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Newsletter
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
