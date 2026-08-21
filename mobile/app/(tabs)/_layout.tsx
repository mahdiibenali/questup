import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { colors, typography } from "../../src/lib/theme";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    today: "\u25CF",
    goals: "\u25B2",
    quests: "\u2605",
    leaderboard: "\u2606",
    analytics: "\u2581\u2582\u2583\u2584",
  };
  return (
    <Text style={{ fontSize: 20, color: focused ? colors.primary : colors.textDim }}>
      {icons[name] || "\u25CF"}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "500" as const },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => <TabIcon name="today" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ focused }) => <TabIcon name="goals" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Quests",
          tabBarIcon: ({ focused }) => <TabIcon name="quests" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Ranks",
          tabBarIcon: ({ focused }) => <TabIcon name="leaderboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Stats",
          tabBarIcon: ({ focused }) => <TabIcon name="analytics" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
