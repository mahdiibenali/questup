import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../../src/api/trpc";
import { colors, spacing, radii, typography } from "../../src/lib/theme";

export default function ChallengesScreen() {
  const { data: challenges, isLoading, refetch } = trpc.challenges.active.useQuery();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.huge }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <Text style={[typography.h1, { color: colors.text, marginBottom: spacing.xl }]}>Daily Quests</Text>

        {challenges && challenges.length > 0 ? (
          challenges.map((c: any) => (
            <View
              key={c.id}
              style={{
                backgroundColor: colors.bgElevated,
                borderWidth: 1,
                borderColor: c.status === "completed" ? colors.success : colors.border,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {c.title || "Daily Challenge"}
                </Text>
                <Text style={[typography.xs, { color: colors.xp }]}>+{c.xpReward ?? 50} XP</Text>
              </View>
              {c.description && (
                <Text style={[typography.sm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                  {c.description}
                </Text>
              )}
              <View style={{ flexDirection: "row", marginTop: spacing.md }}>
                <View
                  style={{
                    backgroundColor: c.status === "completed" ? colors.successMuted : colors.primaryMuted,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                    borderRadius: radii.full,
                  }}
                >
                  <Text
                    style={[
                      typography.xs,
                      { color: c.status === "completed" ? colors.success : colors.primary },
                    ]}
                  >
                    {c.status === "completed" ? "Completed" : "In Progress"}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: "center", paddingTop: spacing.huge }}>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center" }]}>
              No active quests.{"\n"}Complete tasks to unlock daily challenges.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
