"use client";

import { useState } from "react";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useDelete } from "@/hooks/useDelete";
import toast from "react-hot-toast";

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
    { key: "subscribers" as const, label: "Subscribers" },
    { key: "sent" as const, label: "Sent" },
    { key: "compose" as const, label: "Compose" },
  ];

  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Newsletter</h2>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`text-sm px-3 py-1.5 rounded cursor-pointer ${
                  tab === t.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "subscribers" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">{subscribers.length} subscribers</p>
              <div className="flex gap-2">
                {filters.map((f) => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                      filter === f.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {subsLoading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : subscribers.length === 0 ? (
              <p className="text-gray-400 text-sm">No subscribers yet</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto max-w-6xl">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-300 text-gray-500">
                        <th className="py-3 px-4 font-medium">Email</th>
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium">Subscribed</th>
                        <th className="py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub: any) => (
                        <tr key={sub._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">{sub.email}</td>
                          <td className="py-3 px-4 text-gray-500">{sub.name || "—"}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              sub.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {sub.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-400">
                            {new Date(sub.subscribedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => deleteSub.mutate({ id: sub._id } as any)}
                              className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {subscribers.map((sub: any) => (
                    <div key={sub._id} className="border rounded-lg p-4 bg-white">
                      <p className="font-medium text-sm">{sub.email}</p>
                      <p className="text-xs text-gray-400">{sub.name || "—"}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          sub.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {sub.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button onClick={() => deleteSub.mutate({ id: sub._id } as any)}
                        className="text-xs text-red-500 mt-2 cursor-pointer">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === "sent" && (
          <>
            {sentLoading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : sentNewsletters.length === 0 ? (
              <p className="text-gray-400 text-sm">No newsletters sent yet</p>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto max-w-6xl">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-300 text-gray-500">
                        <th className="py-3 px-4 font-medium">Subject</th>
                        <th className="py-3 px-4 font-medium">Recipients</th>
                        <th className="py-3 px-4 font-medium">Sent At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentNewsletters.map((n: any) => (
                        <tr key={n._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{n.subject}</td>
                          <td className="py-3 px-4">{n.sentTo}</td>
                          <td className="py-3 px-4 text-xs text-gray-400">
                            {new Date(n.sentAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden space-y-3">
                  {sentNewsletters.map((n: any) => (
                    <div key={n._id} className="border rounded-lg p-4 bg-white">
                      <p className="font-medium text-sm">{n.subject}</p>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{n.sentTo} recipients</span>
                        <span>{new Date(n.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

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
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Newsletter subject" required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Body (HTML supported)
        </label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary font-mono"
          placeholder="<h1>Hello!</h1><p>Your newsletter content here...</p>" required
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Sending to all active subscribers</span>
      </div>
      <button type="submit" disabled={send.isPending}
        className="bg-primary text-white px-6 py-2 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
        {send.isPending ? "Sending..." : "Send Newsletter"}
      </button>
    </form>
  );
}
