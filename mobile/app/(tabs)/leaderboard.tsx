import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../../src/api/trpc";
import { useAuth } from "../../src/lib/auth-context";
import { colors, spacing, radii, typography } from "../../src/lib/theme";

function RankRow({ rank, name, xp, level, isMe }: { rank: number; name: string; xp: number; level: number; isMe: boolean }) {
  return (
    <View
      style={{
        backgroundColor: isMe ? colors.primaryMuted : colors.bgElevated,
        borderWidth: 1,
        borderColor: isMe ? colors.primary : colors.border,
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text
        style={[
          typography.h3,
          {
            color: rank <= 3 ? colors.xp : colors.textDim,
            width: 32,
            textAlign: "center",
          },
        ]}
      >
        {rank <= 3 ? ["\u2605", "\u2605\u2605", "\u2605\u2605\u2605"][rank - 1] : `#${rank}`}
      </Text>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: spacing.md,
        }}
      >
        <Text style={[typography.sm, { color: colors.textSecondary }]}>{name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyMedium, { color: isMe ? colors.primary : colors.text }]} numberOfLines={1}>
          {name} {isMe ? "(you)" : ""}
        </Text>
        <Text style={[typography.xs, { color: colors.textDim }]}>Level {level}</Text>
      </View>
      <Text style={[typography.mono, { color: colors.xp }]}>{xp.toLocaleString()} XP</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading, refetch } = trpc.leaderboard.global.useQuery();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.huge }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <Text style={[typography.h1, { color: colors.text, marginBottom: spacing.xl }]}>Leaderboard</Text>

        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((entry: any, i: number) => (
            <RankRow
              key={entry.id}
              rank={i + 1}
              name={entry.name || "Unknown"}
              xp={entry.totalXp}
              level={entry.level}
              isMe={entry.id === user?.id}
            />
          ))
        ) : (
          <View style={{ alignItems: "center", paddingTop: spacing.huge }}>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center" }]}>
              No rankings yet.{"\n"}Add friends to compete!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
