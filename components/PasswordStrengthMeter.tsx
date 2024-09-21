// src/components/PasswordStrengthMeter.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
}) => {
  const getPasswordStrength = (
    password: string
  ): { strength: number; label: string } => {
    let strength = 0;
    if (password.length > 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;

    switch (strength) {
      case 0:
        return { strength: 0, label: "" };
      case 1:
        return { strength: 1, label: "Weak" };
      case 2:
        return { strength: 2, label: "Fair" };
      case 3:
        return { strength: 3, label: "Good" };
      case 4:
        return { strength: 4, label: "Strong" };
      case 5:
        return { strength: 5, label: "Very Strong" };
      default:
        return { strength: 1, label: "Weak" };
    }
  };

  const { strength, label } = getPasswordStrength(password);

  return (
    <View style={styles.container}>
      <View style={styles.meterContainer}>
        {[1, 2, 3, 4, 5].map((level) => (
          <View
            key={level}
            style={[
              styles.meterSegment,
              {
                backgroundColor:
                  level <= strength ? getColor(strength) : "#e0e0e0",
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const getColor = (strength: number): string => {
  switch (strength) {
    case 1:
      return "#ff4d4d";
    case 2:
      return "#ffa64d";
    case 3:
      return "#ffff4d";
    case 4:
      return "#4dff4d";
    case 5:
      return "#23b923";
    default:
      return "#e0e0e0";
  }
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  meterContainer: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  meterSegment: {
    flex: 1,
    marginHorizontal: 1,
  },
  label: {
    marginTop: 5,
    textAlign: "center",
  },
});
