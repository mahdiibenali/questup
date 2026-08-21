import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../../src/api/trpc";
import { useAuth } from "../../src/lib/auth-context";
import { colors, spacing, radii, typography } from "../../src/lib/theme";

function LevelBadge({ level }: { level: number }) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={[typography.sm, { color: colors.white, fontWeight: "700" }]}>{level}</Text>
    </View>
  );
}

function XPBar({ current, required: req }: { current: number; required: number }) {
  const pct = Math.min((current / req) * 100, 100);
  return (
    <View style={{ marginTop: spacing.sm }}>
      <View style={{ height: 8, backgroundColor: colors.bgHover, borderRadius: 4, overflow: "hidden" }}>
        <View
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: colors.primary,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgElevated,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        padding: spacing.lg,
        alignItems: "center",
        marginHorizontal: spacing.xs,
      }}
    >
      <Text style={[typography.h2, { color, marginBottom: spacing.xs }]}>{value}</Text>
      <Text style={[typography.xs, { color: colors.textDim }]}>{label}</Text>
    </View>
  );
}

function TaskCard({ task, onComplete }: { task: any; onComplete: () => void }) {
  const isDone = task.status === "completed";
  return (
    <View
      style={{
        backgroundColor: colors.bgElevated,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDone ? colors.successMuted : colors.bgHover,
          justifyContent: "center",
          alignItems: "center",
          marginRight: spacing.md,
        }}
      >
        <Text style={{ color: isDone ? colors.success : colors.textDim, fontSize: 16 }}>
          {isDone ? "\u2713" : task.goal?.category?.slice(0, 2).toUpperCase() || "?"}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
          {task.goal?.title || "Task"}
        </Text>
        <Text style={[typography.xs, { color: colors.textDim, marginTop: 2 }]}>
          {task.goal?.category || ""}
        </Text>
      </View>
      {!isDone && (
        <TouchableOpacity
          onPress={onComplete}
          activeOpacity={0.7}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: radii.md,
          }}
        >
          <Text style={[typography.sm, { color: colors.white, fontWeight: "600" }]}>Do it</Text>
        </TouchableOpacity>
      )}
      {isDone && (
        <Text style={[typography.sm, { color: colors.success, fontWeight: "600" }]}>Done</Text>
      )}
    </View>
  );
}

export default function TodayScreen() {
  const { user } = useAuth();
  const { data: profile, isLoading, refetch } = trpc.user.me.useQuery();
  const { data: tasks, refetch: refetchTasks } = trpc.tasks.today.useQuery();

  const completedCount = tasks?.filter((t: any) => t.status === "completed").length ?? 0;
  const xpToNext = profile ? Math.floor(100 * Math.pow(1.15, profile.level)) : 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.huge }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl }}>
          <View>
            <Text style={[typography.h1, { color: colors.text }]}>
              Hey, {user?.name?.split(" ")[0] || "there"}
            </Text>
            <Text style={[typography.sm, { color: colors.textSecondary, marginTop: 2 }]}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </Text>
          </View>
          <LevelBadge level={profile?.level ?? 1} />
        </View>

        {/* XP Progress */}
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.lg,
            marginBottom: spacing.xl,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[typography.sm, { color: colors.textSecondary }]}>Level {profile?.level ?? 1}</Text>
            <Text style={[typography.xs, { color: colors.primary, fontFamily: "Courier" }]}>
              {profile?.currentLevelXp ?? 0} / {xpToNext} XP
            </Text>
          </View>
          <XPBar current={profile?.currentLevelXp ?? 0} required={xpToNext} />
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", marginBottom: spacing.xl }}>
          <StatCard label="Total XP" value={String(profile?.totalXp ?? 0)} color={colors.xp} />
          <StatCard label="Streaks" value={String(profile?.currentStreaks?.length ?? 0)} color={colors.streak} />
          <StatCard label="Shields" value={String(profile?.freezeTokens ?? 0)} color="#60A5FA" />
        </View>

        {/* Tasks */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <Text style={[typography.h3, { color: colors.text }]}>Today's Tasks</Text>
          <Text style={[typography.xs, { color: colors.textSecondary, fontFamily: "Courier" }]}>
            {completedCount}/{tasks?.length ?? 0}
          </Text>
        </View>

        {tasks && tasks.length > 0 ? (
          tasks.map((task: any) => (
            <View key={task.id} style={{ marginBottom: spacing.sm }}>
              <TaskCard task={task} onComplete={() => {}} />
            </View>
          ))
        ) : (
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.lg,
              padding: spacing.xxxl,
              alignItems: "center",
            }}
          >
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center" }]}>
              No tasks yet.{"\n"}Create a goal to start earning XP.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
