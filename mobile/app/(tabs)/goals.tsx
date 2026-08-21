import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../../src/api/trpc";
import { colors, spacing, radii, typography } from "../../src/lib/theme";

export default function GoalsScreen() {
  const { data: goals, isLoading, refetch } = trpc.goals.list.useQuery();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.huge }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <Text style={[typography.h1, { color: colors.text, marginBottom: spacing.xl }]}>Goals</Text>

        {goals && goals.length > 0 ? (
          goals.map((goal: any) => (
            <View
              key={goal.id}
              style={{
                backgroundColor: colors.bgElevated,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {goal.title}
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primaryMuted,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                    borderRadius: radii.full,
                  }}
                >
                  <Text style={[typography.xs, { color: colors.primary }]}>{goal.category}</Text>
                </View>
              </View>
              {goal.description && (
                <Text style={[typography.sm, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={2}>
                  {goal.description}
                </Text>
              )}
              <View style={{ flexDirection: "row", marginTop: spacing.md, gap: spacing.sm }}>
                <Text style={[typography.xs, { color: colors.textDim }]}>
                  {goal.tasks?.length ?? 0} tasks seeded
                </Text>
                <Text style={[typography.xs, { color: colors.textDim }]}>|</Text>
                <Text style={[typography.xs, { color: colors.textDim }]}>{goal.frequency}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: "center", paddingTop: spacing.huge }}>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center" }]}>
              No goals yet.{"\n"}What do you want to level up?
            </Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            marginTop: spacing.xl,
            height: 48,
            backgroundColor: colors.primary,
            borderRadius: radii.md,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={[typography.bodyMedium, { color: colors.white }]}>+ New Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
