import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../../src/api/trpc";
import { colors, spacing, radii, typography } from "../../src/lib/theme";

function HeatmapRow({ week, label }: { week: number[]; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
      <Text style={[typography.xs, { color: colors.textDim, width: 28 }]}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 3 }}>
        {week.map((val, i) => {
          const intensity = val === 0 ? 0 : Math.min(val / 5, 1);
          return (
            <View
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                backgroundColor:
                  intensity === 0
                    ? colors.bgHover
                    : `rgba(108, 92, 231, ${0.2 + intensity * 0.8})`,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { data: analytics, isLoading, refetch } = trpc.analytics.overview.useQuery();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.huge }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <Text style={[typography.h1, { color: colors.text, marginBottom: spacing.xl }]}>Analytics</Text>

        {/* Stats Overview */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl }}>
          {[
            { label: "Tasks Done", value: String(analytics?.completedTasks ?? 0), color: colors.success },
            { label: "Completion %", value: `${analytics?.completionRate ?? 0}%`, color: colors.primary },
            { label: "Best Streak", value: `${analytics?.bestStreak ?? 0}d`, color: colors.streak },
            { label: "Avg XP/Day", value: String(analytics?.avgXpPerDay ?? 0), color: colors.xp },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                minWidth: "45%",
                backgroundColor: colors.bgElevated,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.lg,
                padding: spacing.lg,
                alignItems: "center",
              }}
            >
              <Text style={[typography.h2, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[typography.xs, { color: colors.textDim, marginTop: spacing.xs }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Heatmap placeholder */}
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.lg,
          }}
        >
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.lg }]}>Activity</Text>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <HeatmapRow
              key={day}
              label={day}
              week={Array.from({ length: 12 }, () => Math.floor(Math.random() * 6))}
            />
          ))}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: spacing.sm, alignItems: "center", gap: spacing.xs }}>
            <Text style={[typography.xs, { color: colors.textDim }]}>Less</Text>
            {[0, 0.3, 0.5, 0.8, 1].map((v) => (
              <View
                key={v}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: v === 0 ? colors.bgHover : `rgba(108, 92, 231, ${0.2 + v * 0.8})`,
                }}
              />
            ))}
            <Text style={[typography.xs, { color: colors.textDim }]}>More</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
