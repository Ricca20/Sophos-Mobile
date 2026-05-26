import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, TextInput, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { AppCard } from "@/components/AppCard";
import { EmptyState } from "@/components/EmptyState";
import { doctorService } from "@/features/doctors/doctorService";
import { colors } from "@/theme/colors";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/utils/i18n";

export default function SpecialistScreen() {
  const router = useRouter();
  const { language: globalLang } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const doctorsQuery = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorService.list(),
  });

  const specialties = useMemo(() => {
    if (!doctorsQuery.data) return [];

    const specialtyMap = new Map();
    doctorsQuery.data.forEach((doctor) => {
      doctor.specialtyIds?.forEach((specialty) => {
        if (!specialty?._id) return;
        const nameEn = specialty.name_en || specialty.en || specialty.name?.en || "";
        const nameRu = specialty.name_ru || specialty.ru || specialty.name?.ru || nameEn || "";
        const displayName = globalLang === "ru" ? nameRu : nameEn;

        if (!specialtyMap.has(specialty._id)) {
          specialtyMap.set(specialty._id, {
            id: specialty._id,
            name: displayName,
            count: 1,
          });
        } else {
          const current = specialtyMap.get(specialty._id);
          current.count += 1;
        }
      });
    });

    const list = Array.from(specialtyMap.values());
    list.sort((a, b) => b.count - a.count);
    return list;
  }, [doctorsQuery.data, globalLang]);

  const filteredSpecialties = useMemo(() => {
    if (!searchQuery) return specialties;
    const q = searchQuery.toLowerCase();
    return specialties.filter((s) => s.name.toLowerCase().includes(q));
  }, [specialties, searchQuery]);

  const handleSelectSpecialty = (specialty) => {
    router.push({
      pathname: "/(tabs)/doctors",
      params: { specialtyId: specialty.id, specialtyName: specialty.name },
    });
  };

  return (
    <Screen>
      <SectionHeader
        title={t("specialists.page_title", globalLang) || "Specialists"}
        subtitle={
          t("specialists.page_description", globalLang) ||
          "Find specialists by category and consult with medical professionals."
        }
      />

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("specialists.search_placeholder", globalLang) || "Search specialty..."}
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x-circle" size={18} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      {doctorsQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : doctorsQuery.isError ? (
        <EmptyState
          title="Load failed"
          message="Could not load specialties."
          actionLabel="Retry"
          onAction={() => doctorsQuery.refetch()}
        />
      ) : filteredSpecialties.length === 0 ? (
        <EmptyState
          title="No results found"
          message="Try adjusting your search terms to find available specialties."
        />
      ) : (
        <FlatList
          data={filteredSpecialties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppCard style={styles.card}>
              <Pressable
                onPress={() => handleSelectSpecialty(item)}
                style={styles.cardPressable}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.specialtyName}>{item.name}</Text>
                  <Text style={styles.doctorCount}>
                    {item.count} {item.count === 1 ? "Doctor" : "Doctors"}
                  </Text>
                </View>
                <View style={styles.arrowButton}>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </View>
              </Pressable>
            </AppCard>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  cardPressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  specialtyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  doctorCount: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
});
