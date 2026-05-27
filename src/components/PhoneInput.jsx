import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
  FlatList,
  Platform,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { spacing } from "@/theme/spacing";
import { useAuth } from "@/hooks/useAuth";
import countriesData from "./countries.json";

export const COUNTRIES = countriesData;

export const parsePhoneNumber = (value, defaultLang = "en") => {
  const defaultCountry = defaultLang === "ru"
    ? COUNTRIES.find((c) => c.code === "RU") || COUNTRIES[0]
    : COUNTRIES.find((c) => c.code === "US") || COUNTRIES[0];

  if (!value) {
    return { country: defaultCountry, nationalNumber: "" };
  }

  // Clean value (only digits)
  const digits = value.replace(/\D/g, "");

  // Try to find the longest matching prefix
  const sortedCountries = [...COUNTRIES].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const country of sortedCountries) {
    if (digits.startsWith(country.prefix)) {
      return {
        country,
        nationalNumber: digits.slice(country.prefix.length),
      };
    }
  }

  // Fallback
  return {
    country: defaultCountry,
    nationalNumber: digits,
  };
};

export const PhoneInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  let globalLang = "en";
  try {
    const auth = useAuth();
    globalLang = auth?.language || "en";
  } catch {
    // fallback
  }

  const { country, nationalNumber } = useMemo(
    () => parsePhoneNumber(value, globalLang),
    [value, globalLang]
  );

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES;
    const q = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.prefix.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleOpenModal = () => {
    setSearchQuery("");
    setIsModalOpen(true);
  };

  const handleTextChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    onChangeText(country.prefix + cleaned);
  };

  const handleCountrySelect = (newCountry) => {
    onChangeText(newCountry.prefix + nationalNumber);
    setIsModalOpen(false);
  };

  return (
    <View style={styles.inputContainer}>
      {label && (
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
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        {/* Country Selector Trigger */}
        <Pressable
          disabled={disabled}
          onPress={handleOpenModal}
          style={({ pressed }) => [
            styles.countryTrigger,
            pressed && styles.countryTriggerPressed,
          ]}
        >
          <Text style={styles.countryFlag}>{country.flag}</Text>
          <Text style={styles.countryPrefix}>+{country.prefix}</Text>
          <Feather name="chevron-down" size={14} color="#6B7A90" style={styles.chevron} />
        </Pressable>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Number Input */}
        <TextInput
          value={nationalNumber}
          onChangeText={handleTextChange}
          placeholder={placeholder || "Enter number"}
          placeholderTextColor="#94A3B8"
          editable={!disabled}
          keyboardType="phone-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.inputField, disabled && styles.inputFieldDisabled]}
        />
      </View>

      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}

      {/* Country Selection Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsModalOpen(false)} />
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Country Code</Text>
                <Pressable onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                  <Feather name="x" size={20} color="#10233F" />
                </Pressable>
              </View>

              <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                  <Feather name="search" size={16} color="#6B7A90" style={styles.searchIcon} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search country..."
                    placeholderTextColor="#94A3B8"
                    style={styles.searchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchQuery ? (
                    <Pressable onPress={() => setSearchQuery("")} style={styles.clearSearchBtn}>
                      <Feather name="x-circle" size={16} color="#94A3B8" />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code + "_" + item.prefix}
                renderItem={({ item }) => {
                  const isSelected = item.code === country.code && item.prefix === country.prefix;
                  return (
                    <Pressable
                      onPress={() => handleCountrySelect(item)}
                      style={({ pressed }) => [
                        styles.countryItem,
                        isSelected && styles.countryItemActive,
                        pressed && styles.countryItemPressed,
                      ]}
                    >
                      <Text style={styles.itemFlag}>{item.flag}</Text>
                      <Text style={[styles.itemName, isSelected && styles.itemTextActive]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.itemPrefix, isSelected && styles.itemTextActive]}>
                        +{item.prefix}
                      </Text>
                    </Pressable>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
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
    height: 52,
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
  countryTrigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: "100%",
    gap: 6,
  },
  countryTriggerPressed: {
    opacity: 0.7,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryPrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10233F",
  },
  chevron: {
    marginLeft: 2,
  },
  separator: {
    width: 1.5,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  inputField: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#10233F",
    paddingHorizontal: 16,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 13, 22, 0.45)",
    justifyContent: "flex-end",
  },
  modalSafeArea: {
    maxHeight: "80%",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    ...Platform.select({
      web: {
        boxShadow: "0 -8px 24px rgba(9, 13, 22, 0.15)",
      },
      ios: {
        shadowColor: "#0F4C81",
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -8 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#10233F",
    fontWeight: "600",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  clearSearchBtn: {
    padding: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10233F",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  countryItemActive: {
    backgroundColor: "rgba(15, 76, 129, 0.08)",
  },
  countryItemPressed: {
    opacity: 0.8,
  },
  itemFlag: {
    fontSize: 22,
    marginRight: 14,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  itemPrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  itemTextActive: {
    color: "#0F4C81",
    fontWeight: "800",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
});
