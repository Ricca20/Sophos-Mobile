import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  disabled,
  autoCapitalize = "none",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      {label ? (
        <Text
          style={[
            styles.inputLabel,
            isFocused && styles.inputLabelFocused,
            error && styles.inputLabelError,
            disabled && styles.inputLabelDisabled,
          ]}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        {leftIcon && (
          <Feather
            name={leftIcon}
            size={18}
            color={error ? "#EF4444" : isFocused ? "#0F4C81" : "#6B7A90"}
            style={[styles.inputLeftIcon, { pointerEvents: "none" }]}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.inputField,
            leftIcon ? { paddingLeft: 44 } : null,
            rightIcon ? { paddingRight: 44 } : null,
            disabled && styles.inputFieldDisabled,
          ]}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.inputRightIcon}>
            <Feather
              name={rightIcon}
              size={18}
              color={isFocused ? "#0F4C81" : "#6B7A90"}
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingLeft: 2,
  },
  inputLabelFocused: {
    color: "#0F4C81",
  },
  inputLabelError: {
    color: "#EF4444",
  },
  inputLabelDisabled: {
    color: "#94A3B8",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    height: 54,
    position: "relative",
  },
  inputWrapperFocused: {
    borderColor: "#0F4C81",
    backgroundColor: "#FFFFFF",
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  inputWrapperDisabled: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  inputLeftIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  inputRightIcon: {
    position: "absolute",
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  inputField: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#10233F",
    paddingHorizontal: 18,
    fontWeight: "600",
  },
  inputFieldDisabled: {
    color: "#64748B",
  },
  inputErrorText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "700",
    marginTop: 2,
    paddingLeft: 4,
  },
});
