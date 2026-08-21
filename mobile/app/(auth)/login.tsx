import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../src/lib/auth-context";
import { colors, spacing, radii, typography } from "../../src/lib/theme";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const result = isSignUp
      ? await signUp(email, password, name)
      : await signIn(email, password);

    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={{ alignItems: "center", marginBottom: spacing.huge }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.lg,
              backgroundColor: colors.primaryMuted,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 28, color: colors.primary }}>^</Text>
          </View>
          <Text style={[typography.h1, { color: colors.text, marginBottom: spacing.xs }]}>LevelUp</Text>
          <Text style={[typography.sm, { color: colors.textSecondary }]}>Your life, gamified.</Text>
        </View>

        {/* Form */}
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.xl,
          }}
        >
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.lg }]}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>

          {isSignUp && (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[typography.xs, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.textDim}
                style={{
                  height: 44,
                  backgroundColor: colors.bg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radii.md,
                  paddingHorizontal: spacing.lg,
                  color: colors.text,
                  fontSize: 14,
                }}
              />
            </View>
          )}

          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.xs, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textDim}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                height: 44,
                backgroundColor: colors.bg,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                paddingHorizontal: spacing.lg,
                color: colors.text,
                fontSize: 14,
              }}
            />
          </View>

          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.xs, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={colors.textDim}
              secureTextEntry
              style={{
                height: 44,
                backgroundColor: colors.bg,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                paddingHorizontal: spacing.lg,
                color: colors.text,
                fontSize: 14,
              }}
            />
          </View>

          {error ? (
            <View
              style={{
                backgroundColor: colors.streakMuted,
                borderRadius: radii.md,
                padding: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <Text style={[typography.sm, { color: colors.streak }]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !email || !password}
            activeOpacity={0.8}
            style={{
              height: 44,
              backgroundColor: colors.primary,
              borderRadius: radii.md,
              justifyContent: "center",
              alignItems: "center",
              opacity: loading || !email || !password ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={[typography.bodyMedium, { color: colors.white }]}>
                {isSignUp ? "Get started" : "Sign in"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggle */}
        <TouchableOpacity
          onPress={() => { setIsSignUp(!isSignUp); setError(""); }}
          style={{ paddingVertical: spacing.lg, alignItems: "center" }}
        >
          <Text style={[typography.sm, { color: colors.textSecondary }]}>
            {isSignUp ? "Already have an account? " : "New here? "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              {isSignUp ? "Sign in" : "Create an account"}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
