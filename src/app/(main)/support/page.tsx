"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Ticket {
  _id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: Array<{ sender: string; message: string; createdAt: string; }>;
  createdAt: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({ subject: "", category: "general", priority: "medium", message: "" });
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/api/support/my");
      if (data.success) setTickets(data.tickets);
    } catch (error) { console.error("Failed to fetch tickets:", error); }
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post("/api/support/", formData);
      if (data.success) {
        toast.success("Ticket created successfully!");
        setShowCreateForm(false);
        setFormData({ subject: "", category: "general", priority: "medium", message: "" });
        fetchTickets();
      } else toast.error(data.message || "Failed to create ticket");
    } catch (error: any) { toast.error(error.message || "Something went wrong"); }
    finally { setIsLoading(false); }
  };

  const replyToTicket = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setIsLoading(true);
    try {
      const { data } = await api.post(`/api/support/${selectedTicket._id}/reply`, { message: replyMessage });
      if (data.success) { toast.success("Reply sent!"); setReplyMessage(""); setSelectedTicket(data.ticket); fetchTickets(); }
    } catch (error: any) { toast.error(error.message || "Failed to send reply"); }
    finally { setIsLoading(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-yellow-50 text-yellow-700";
      case "in-progress": return "bg-blue-50 text-blue-700";
      case "resolved": return "bg-green-50 text-green-700";
      case "closed": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-50 text-red-700";
      case "high": return "bg-orange-50 text-orange-700";
      case "medium": return "bg-yellow-50 text-yellow-700";
      case "low": return "bg-green-50 text-green-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Center</h1>
            <p className="text-sm text-muted mt-0.5">{tickets.length} tickets</p>
          </div>
          <button onClick={() => setShowCreateForm(true)}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Ticket
          </button>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="bg-white border border-border-light rounded-2xl p-6 mb-6 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-4">Create Support Ticket</h2>
            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                <input type="text" value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none"
                  placeholder="Brief description of your issue" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                  <select value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none">
                    <option value="general">General</option>
                    <option value="order">Order Issue</option>
                    <option value="delivery">Delivery Problem</option>
                    <option value="payment">Payment Issue</option>
                    <option value="product">Product Quality</option>
                    <option value="refund">Refund Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
                  <select value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                <textarea value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none resize-none"
                  rows={4} placeholder="Describe your issue in detail..." required />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isLoading}
                  className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer">
                  {isLoading ? "Submitting..." : "Submit Ticket"}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)}
                  className="border border-border text-muted px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-hover transition-all cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No tickets yet</h3>
            <p className="text-sm text-muted">Create one if you need help</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket._id} onClick={() => setSelectedTicket(ticket)}
                className="bg-white border border-border-light rounded-2xl p-4 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{ticket.subject}</h3>
                    <p className="text-xs text-muted mt-1">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs text-muted bg-surface-hover px-2.5 py-1 rounded-lg">
                    {ticket.messages.length} messages
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
              <div className="p-5 border-b border-border-light flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-muted hover:text-foreground hover:bg-border-light transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedTicket.messages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === "customer" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      message.sender === "customer" ? "gradient-primary text-white rounded-br-md" : "bg-surface-hover text-foreground rounded-bl-md"
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.sender === "customer" ? "text-white/60" : "text-muted"}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== "closed" && (
                <div className="p-5 border-t border-border-light">
                  <div className="flex gap-2">
                    <input type="text" value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none"
                      onKeyDown={(e) => e.key === "Enter" && replyToTicket()} />
                    <button onClick={replyToTicket} disabled={isLoading || !replyMessage.trim()}
                      className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer">
                      {isLoading ? "..." : "Send"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
