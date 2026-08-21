"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, Search, Check, X } from "lucide-react";

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const { data: friends, isLoading, refetch } = trpc.user.myFriends.useQuery();
  const { data: pending } = trpc.user.pendingRequests.useQuery();
  const { data: results, isFetching: searching } = trpc.user.searchFriends.useQuery(
    { q: search },
    { enabled: search.length >= 2 }
  );
  const utils = trpc.useUtils();

  const sendRequest = trpc.user.sendFriendRequest.useMutation({ onSuccess: () => { utils.user.searchFriends.invalidate(); } });
  const acceptRequest = trpc.user.acceptFriendRequest.useMutation({ onSuccess: () => { refetch(); utils.user.pendingRequests.invalidate(); } });
  const rejectRequest = trpc.user.rejectFriendRequest.useMutation({ onSuccess: () => utils.user.pendingRequests.invalidate() });
  const removeFriend = trpc.user.removeFriend.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-6 stagger-children">
      <h1 className="text-2xl font-display font-bold text-text">Friends</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full h-11 pl-10 pr-4 bg-bg border border-border rounded-lg text-text placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-elevated transition-all"
        />
      </div>

      {/* Search Results */}
      {search.length >= 2 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-dim uppercase tracking-wider">Search Results</p>
          {searching ? (
            <div className="h-16 bg-bg-elevated border border-border rounded-xl animate-skeleton-pulse" />
          ) : results && results.length > 0 ? (
            results.map((user) => (
              <div key={user.id} className="bg-bg-elevated border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {user.image ? <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" /> : user.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{user.name}</p>
                </div>
                <button
                  onClick={() => sendRequest.mutate({ friendId: user.id })}
                  disabled={sendRequest.isPending}
                  className="h-8 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-lg transition-all duration-150 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-text-dim">No users found</p>
          )}
        </div>
      )}

      {/* Pending Requests */}
      {pending && pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-dim uppercase tracking-wider">Pending Requests</p>
          {pending.map((req) => (
            <div key={req.from.id} className="bg-bg-elevated border border-primary rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                {req.from.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{req.from.name}</p>
                <p className="text-xs text-text-dim">wants to be your friend</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => acceptRequest.mutate({ friendId: req.from.id })}
                  className="w-8 h-8 rounded-lg bg-success-muted flex items-center justify-center text-success hover:bg-success/20 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => rejectRequest.mutate({ friendId: req.from.id })}
                  className="w-8 h-8 rounded-lg bg-streak-muted flex items-center justify-center text-streak hover:bg-streak/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-text-dim uppercase tracking-wider">Friends</p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-bg-elevated border border-border rounded-xl animate-skeleton-pulse" />)}
          </div>
        ) : friends && friends.length > 0 ? (
          friends.map((f) => (
            <div key={f.user.id} className="bg-bg-elevated border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:border-border-strong">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center text-primary font-semibold text-sm shrink-0 overflow-hidden">
                {f.user.image ? <img src={f.user.image} alt="" className="w-full h-full object-cover" /> : f.user.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{f.user.name}</p>
                <p className="text-xs text-text-dim">Level {f.user.level} &middot; {f.user.totalXp} XP</p>
              </div>
              <button onClick={() => removeFriend.mutate({ friendId: f.user.id })}
                className="p-1.5 rounded-md text-text-dim hover:text-streak hover:bg-streak-muted transition-colors" title="Remove">
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-bg-elevated border border-border rounded-xl p-8 text-center">
            <p className="text-text-secondary mb-1">No friends yet</p>
            <p className="text-sm text-text-dim">Search above to find people</p>
          </div>
        )}
      </div>
    </div>
  );
}
