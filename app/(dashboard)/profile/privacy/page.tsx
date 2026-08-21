"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Shield, Search, UserPlus, UserMinus } from "lucide-react";

export default function PrivacyPage() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: friends } = trpc.user.myFriends.useQuery();
  const { data: pending } = trpc.user.pendingRequests.useQuery();
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; image: string | null }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const utils = trpc.useUtils();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => utils.user.me.invalidate(),
  });

  const sendRequest = trpc.user.sendFriendRequest.useMutation({
    onSuccess: () => {
      utils.user.pendingRequests.invalidate();
      alert("Friend request sent!");
    },
  });

  const acceptRequest = trpc.user.acceptFriendRequest.useMutation({
    onSuccess: () => {
      utils.user.pendingRequests.invalidate();
      utils.user.myFriends.invalidate();
    },
  });

  const rejectRequest = trpc.user.rejectFriendRequest.useMutation({
    onSuccess: () => utils.user.pendingRequests.invalidate(),
  });

  const removeFriend = trpc.user.removeFriend.useMutation({
    onSuccess: () => utils.user.myFriends.invalidate(),
  });

  const searchFriendsQuery = trpc.user.searchFriends.useQuery(
    { q: searchQuery },
    { enabled: false }
  );

  const handleSearch = async () => {
    if (searchQuery.length >= 2) {
      const results = await searchFriendsQuery.refetch();
      if (results.data) setSearchResults(results.data);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Privacy & Friends</h1>

      <div className="bg-surface rounded-card p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Profile Visibility
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {(["public", "friends", "private"] as const).map((pref) => (
            <button
              key={pref}
              onClick={() => updateProfile.mutate({ privacyPreference: pref })}
              className={`py-2 rounded-card text-sm font-medium capitalize transition-colors ${
                user?.privacyPreference === pref
                  ? "bg-primary text-white"
                  : "bg-surface-light text-text-muted hover:bg-surface"
              }`}
            >
              {pref}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-surface-light">
          <span className="text-sm text-text-muted">Allow friend discovery</span>
          <button
            onClick={() => updateProfile.mutate({ friendDiscovery: !user?.friendDiscovery })}
            className={`w-12 h-6 rounded-full transition-colors ${
              user?.friendDiscovery ? "bg-primary" : "bg-surface-light"
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
              user?.friendDiscovery ? "translate-x-6" : "translate-x-0.5"
            }`} />
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-card p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" />
          Find Friends
        </h2>
        <div className="flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name or email..."
            className="flex-1 bg-background border border-surface-light rounded-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-card transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {pending && pending.length > 0 && (
        <div className="bg-surface rounded-card p-4 space-y-3">
          <h2 className="font-semibold">Pending Requests ({pending.length})</h2>
          {pending.map((req) => (
            <div key={req.from.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">
                  {req.from.name?.charAt(0)}
                </div>
                <span className="text-sm">{req.from.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptRequest.mutate({ friendId: req.from.id })}
                  className="px-3 py-1 bg-success/20 text-success text-sm rounded-card"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectRequest.mutate({ friendId: req.from.id })}
                  className="px-3 py-1 bg-error/20 text-error text-sm rounded-card"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface rounded-card p-4 space-y-3">
        <h2 className="font-semibold">Friends ({friends?.length ?? 0})</h2>
        {friends && friends.length > 0 ? (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm overflow-hidden">
                    {f.user.image ? (
                      <img src={f.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      f.user.name?.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{f.user.name}</p>
                    <p className="text-xs text-text-muted">Lvl {f.user.level} • {f.user.totalXp} XP</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFriend.mutate({ friendId: f.user.id })}
                  className="p-1 text-text-muted hover:text-error"
                  title="Remove friend"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No friends yet. Use search to find people!</p>
        )}
      </div>
    </div>
  );
}
