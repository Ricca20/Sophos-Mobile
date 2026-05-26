import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { AppCard } from "@/components/AppCard";
import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/features/profile/profileService";
import { PhoneInput } from "@/components/PhoneInput";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { t } from "@/utils/i18n";
import { useToast } from "@/context/ToastContext";
import { env } from "@/utils/env";

// Local FormInput Component
const LocalFormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  disabled,
  keyboardType,
  leftIcon,
  error,
  autoCapitalize = "none",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
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
            style={styles.inputLeftIcon}
            pointerEvents="none"
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.inputField,
            leftIcon ? { paddingLeft: 44 } : null,
            disabled && styles.inputFieldDisabled,
          ]}
        />
      </View>
      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}
    </View>
  );
};

const CalendarInput = ({ label, value, onPress, error }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text
        style={[
          styles.inputLabel,
          isFocused && styles.inputLabelFocused,
          error && styles.inputLabelError,
        ]}
      >
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          styles.calendarWrapper,
          pressed && styles.calendarPressed,
        ]}
      >
        <Text style={[styles.calendarValue, !value && styles.calendarPlaceholder]}>
          {value || "Select date"}
        </Text>
        <Feather name="calendar" size={18} color={error ? "#EF4444" : "#6B7A90"} />
      </Pressable>
      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}
    </View>
  );
};

const pad = (value) => String(value).padStart(2, "0");

const toISODate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseISODate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameCalendarDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const buildCalendarCells = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: startDay }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
};

const formatCalendarHeader = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const formatCurrencyCode = (value) => {
  const numericValue = Number(value ?? 0);

  if (Number.isNaN(numericValue)) {
    return "USD 0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const baseInitialFormData = {
  patientId: "",
  email: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "Male",
  dateOfBirth: "",
  phoneNumber: "",
  additionalPhone: "",
  maxId: "",
  telegramNickname: "",
  telegramId: "",
  newsletter: false,
  egisz: false,
  instagram: "",
  vk: "",
  facebook: "",
  ok: "",
  contactPerson: "",
  contactPersonPhone: "",
  cmip: "",
  cmipDate: "",
  cmipOrgCode: "",
  snils: "",
  medInsuranceOrg: "",
  socialSupportCode: "",
  citizenship: "",
  documentType: "",
  documentSeries: "",
  documentNumber: "",
  documentIssuedDate: "",
  departmentCode: "",
  documentIssuedBy: "",
  inn: "",
  addressType: "",
  region: "",
  district: "",
  city: "",
  settlement: "",
  street: "",
  house: "",
  terrain: "",
  apartment: "",
  postcode: "",
  geocoordinates: "",
  registrationChange: "",
  maritalStatus: "",
  education: "",
  employment: "",
  placeOfWork: "",
  workSpecialty: "",
  changePlaceOfWork: "",
  changeOfPosition: "",
  disability: "",
  disabilityFrom: "",
  disabilityTo: "",
  disabilityIndefinitely: false,
  invalidGroup: "",
  disabilityType: "",
  disabilityPrimaryRepeated: "",
  notificationLanguage: "en",
  notes: "",
  comments: "",
  diseases: [],
  finalDiagnoses: [],
  radiationDoses: [],
  legalRepresentatives: [],
};

const EMPTY_SUBSCHEMA_ITEMS = {
  diseases: {
    startDate: "",
    endDate: "",
    diagnosis: "",
    icdCode: "",
    doctor: "",
  },
  finalDiagnoses: {
    date: "",
    diagnosis: "",
    icdCode: "",
    primary: "1",
    doctorName: "",
    jobTitle: "",
    speciality: "",
  },
  radiationDoses: {
    date: "",
    researchType: "",
    effectiveDose: "",
    note: "",
  },
  legalRepresentatives: {
    lastName: "",
    firstName: "",
    middleName: "",
    isCurrent: false,
    birthday: "",
    gender: "",
    relationship: "",
    attitudeToPatient: "",
    documentOfAuthority: "",
    documentType: "",
    series: "",
    number: "",
    whenIssued: "",
    issuedBy: "",
    snils: "",
    address: "",
    addressType: "",
    tenant: "",
    subjectOfRussia: "",
    district: "",
    city: "",
    settlement: "",
    street: "",
    house: "",
    apartment: "",
    state: "",
  },
};

const formatDateForInput = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString().split("T")[0];
};

const mapSubschemaArray = (value, key) => {
  if (!Array.isArray(value)) return [];

  if (key === "diseases") {
    return value.map((item) => ({
      ...EMPTY_SUBSCHEMA_ITEMS.diseases,
      ...item,
      startDate: formatDateForInput(item.startDate),
      endDate: formatDateForInput(item.endDate),
    }));
  }

  if (key === "finalDiagnoses") {
    return value.map((item) => ({
      ...EMPTY_SUBSCHEMA_ITEMS.finalDiagnoses,
      ...item,
      date: formatDateForInput(item.date),
      primary: item.primary || "1",
    }));
  }

  if (key === "radiationDoses") {
    return value.map((item) => ({
      ...EMPTY_SUBSCHEMA_ITEMS.radiationDoses,
      ...item,
      date: formatDateForInput(item.date),
    }));
  }

  if (key === "legalRepresentatives") {
    return value.map((item) => ({
      ...EMPTY_SUBSCHEMA_ITEMS.legalRepresentatives,
      ...item,
      birthday: formatDateForInput(item.birthday),
      whenIssued: formatDateForInput(item.whenIssued),
      isCurrent: Boolean(item.isCurrent),
    }));
  }

  return [];
};

// Reusable SegmentedControl Component
const SegmentedControl = ({ label, value, options, onChange }) => {
  return (
    <View style={styles.segmentedContainer}>
      {label && <Text style={styles.segmentedLabel}>{label}</Text>}
      <View style={styles.segmentRow}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// Reusable FormCheckbox Component
const FormCheckbox = ({ label, value, onValueChange }) => {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={styles.checkboxContainer}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Feather name="check" size={14} color="#FFF" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, language: globalLang, changeLanguage, syncPatientProfile, isAuthenticated, accessToken } = useAuth();
  const { showToast } = useToast();

  // Query profile details
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.getProfile(),
    enabled: isAuthenticated,
  });

  // Local Form State
  const [formData, setFormData] = useState(baseInitialFormData);
  const [activeDateField, setActiveDateField] = useState(null); // string | { schemaKey, index, fieldName }
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    contacts: false,
    documents: false,
    address: false,
    personalData: false,
    disability: false,
    diseases: false,
    finalDiagnoses: false,
    radiationDoses: false,
    legalRepresentatives: false,
    additionalNotes: false,
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Error States
  const [errors, setErrors] = useState({});

  // Populate local form state when query resolves
  useEffect(() => {
    if (profileQuery.data) {
      const data = profileQuery.data;
      const loadedData = { ...baseInitialFormData };
      Object.keys(baseInitialFormData).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          if (
            key === "dateOfBirth" ||
            key === "cmipDate" ||
            key === "documentIssuedDate" ||
            key === "disabilityFrom" ||
            key === "disabilityTo"
          ) {
            const d = new Date(data[key]);
            if (!isNaN(d.getTime())) {
              loadedData[key] = d.toISOString().split("T")[0]; // YYYY-MM-DD
            } else {
              loadedData[key] = "";
            }
          } else if (typeof baseInitialFormData[key] === "boolean") {
            loadedData[key] = Boolean(data[key]);
          } else if (
            key === "diseases" ||
            key === "finalDiagnoses" ||
            key === "radiationDoses" ||
            key === "legalRepresentatives"
          ) {
            loadedData[key] = mapSubschemaArray(data[key], key);
          } else {
            loadedData[key] = String(data[key]);
          }
        }
      });
      setFormData(loadedData);
    }
  }, [profileQuery.data]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to sign out.", "error");
    }
  };

  const handleSave = async () => {
    const newErrors = {};

    // Validate FirstName
    if (!formData.firstName.trim()) {
      newErrors.firstName = t("profile.errors.firstName", globalLang) || "First name is required.";
    }

    // Validate LastName
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("profile.errors.lastName", globalLang) || "Last name is required.";
    }

    // Validate Date of Birth (YYYY-MM-DD)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = t("profile.errors.dateOfBirth", globalLang) || "Date of birth is required.";
    } else if (!dobRegex.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = t("profile.errors.invalidDateOfBirth", globalLang) || "Invalid date of birth.";
    } else {
      const d = new Date(formData.dateOfBirth);
      if (isNaN(d.getTime())) {
        newErrors.dateOfBirth = t("profile.errors.invalidDateOfBirth", globalLang) || "Invalid date of birth.";
      } else if (d > new Date()) {
        newErrors.dateOfBirth = t("profile.errors.futureDateOfBirth", globalLang) || "Date of birth cannot be in the future.";
      }
    }

    // Validate Phone Number
    const phoneRegex = /^\+?\d{10,15}$/;
    const cleanPhone = formData.phoneNumber.replace(/\s+/g, "");
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t("profile.errors.phoneNumber", globalLang) || "Phone number is required.";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phoneNumber = t("profile.errors.invalidPhoneNumber", globalLang) || "Invalid phone number format.";
    }

    // Validate Additional Phone
    let cleanAddPhone = "";
    if (formData.additionalPhone.trim()) {
      cleanAddPhone = formData.additionalPhone.replace(/\s+/g, "");
      if (!phoneRegex.test(cleanAddPhone)) {
        newErrors.additionalPhone = t("profile.errors.invalidAdditionalPhone", globalLang) || "Invalid additional phone number format.";
      }
    }

    // Validate Contact Person Phone
    let cleanContactPhone = "";
    if (formData.contactPersonPhone.trim()) {
      cleanContactPhone = formData.contactPersonPhone.replace(/\s+/g, "");
      if (!phoneRegex.test(cleanContactPhone)) {
        newErrors.contactPersonPhone = "Invalid emergency contact phone format.";
      }
    }

    setErrors(newErrors);
    const hasError = Object.keys(newErrors).length > 0;

    if (hasError) {
      showToast(t("profile.errors.fixErrors", globalLang) || "Please fix all errors before saving.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizeSubschemaDate = (value) => {
        if (!value) return null;
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      const buildSubschemaPayload = (schemaKey) => {
        const values = Array.isArray(formData[schemaKey]) ? formData[schemaKey] : [];

        if (schemaKey === "diseases") {
          return values
            .map((item) => ({
              startDate: normalizeSubschemaDate(item.startDate),
              endDate: normalizeSubschemaDate(item.endDate),
              diagnosis: item.diagnosis || "",
              icdCode: item.icdCode || "",
              doctor: item.doctor || "",
            }))
            .filter((item) => Object.values(item).some((value) => value));
        }

        if (schemaKey === "finalDiagnoses") {
          return values
            .map((item) => ({
              date: normalizeSubschemaDate(item.date),
              diagnosis: item.diagnosis || "",
              icdCode: item.icdCode || "",
              primary: item.primary || "1",
              doctorName: item.doctorName || "",
              jobTitle: item.jobTitle || "",
              speciality: item.speciality || "",
            }))
            .filter((item) => Object.values(item).some((value) => value && value !== "1"));
        }

        if (schemaKey === "radiationDoses") {
          return values
            .map((item) => ({
              date: normalizeSubschemaDate(item.date),
              researchType: item.researchType || "",
              effectiveDose: item.effectiveDose || "",
              note: item.note || "",
            }))
            .filter((item) => Object.values(item).some((value) => value));
        }

        if (schemaKey === "legalRepresentatives") {
          return values
            .map((item) => ({
              lastName: item.lastName || "",
              firstName: item.firstName || "",
              middleName: item.middleName || "",
              isCurrent: Boolean(item.isCurrent),
              birthday: normalizeSubschemaDate(item.birthday),
              gender: item.gender || "",
              relationship: item.relationship || "",
              attitudeToPatient: item.attitudeToPatient || "",
              documentOfAuthority: item.documentOfAuthority || "",
              documentType: item.documentType || "",
              series: item.series || "",
              number: item.number || "",
              whenIssued: normalizeSubschemaDate(item.whenIssued),
              issuedBy: item.issuedBy || "",
              snils: item.snils || "",
              address: item.address || "",
              addressType: item.addressType || "",
              tenant: item.tenant || "",
              subjectOfRussia: item.subjectOfRussia || "",
              district: item.district || "",
              city: item.city || "",
              settlement: item.settlement || "",
              street: item.street || "",
              house: item.house || "",
              apartment: item.apartment || "",
              state: item.state || "",
            }))
            .filter((item) => Object.values(item).some((value) => value));
        }

        return [];
      };

      const payload = {
        ...formData,
        patientId: profileQuery.data?.patientId || "",
        phoneNumber: cleanPhone,
        additionalPhone: cleanAddPhone,
        contactPersonPhone: cleanContactPhone,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        cmipDate: formData.cmipDate ? new Date(formData.cmipDate).toISOString() : null,
        documentIssuedDate: formData.documentIssuedDate ? new Date(formData.documentIssuedDate).toISOString() : null,
        disabilityFrom: formData.disabilityFrom ? new Date(formData.disabilityFrom).toISOString() : null,
        disabilityTo: formData.disabilityTo ? new Date(formData.disabilityTo).toISOString() : null,
        notificationLanguage: globalLang,
        diseases: buildSubschemaPayload("diseases"),
        finalDiagnoses: buildSubschemaPayload("finalDiagnoses"),
        radiationDoses: buildSubschemaPayload("radiationDoses"),
        legalRepresentatives: buildSubschemaPayload("legalRepresentatives"),
      };

      const response = await profileService.updateProfile(payload);

      // Sync Context State (triggers profileCompleted overlay removal)
      await syncPatientProfile({
        firstName: payload.firstName,
        lastName: payload.lastName,
        profileCompleted: true,
      });

      // Refetch Query
      await profileQuery.refetch();

      showToast(
        response?.message || t("profile.saveSuccess", globalLang) || "Profile saved successfully!",
        "success"
      );
    } catch (error) {
      console.warn("Save profile error:", error);
      showToast(
        error?.response?.data?.message || error.message || t("profile.saveFailed", globalLang) || "Failed to save profile",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageToggle = (langCode) => {
    if (globalLang !== langCode) {
      changeLanguage(langCode);
    }
  };

  const handleUploadImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permission to access gallery is required.", "error");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      const selectedUri = pickerResult.assets[0].uri;

      setIsSubmitting(true);
      const patientId = profileQuery.data?.patientId;
      if (!patientId) {
        showToast("Unable to upload: Patient ID not found.", "error");
        setIsSubmitting(false);
        return;
      }

      await profileService.uploadProfilePicture(selectedUri, patientId);
      showToast("Profile picture updated successfully!", "success");
      profileQuery.refetch();
    } catch (error) {
      console.warn("Upload profile picture error:", error);
      showToast("Failed to upload profile picture.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCalendar = (fieldSpec) => {
    setActiveDateField(fieldSpec);
    let currentVal = "";
    if (typeof fieldSpec === "string") {
      currentVal = formData[fieldSpec] || "";
    } else if (fieldSpec && typeof fieldSpec === "object") {
      const { schemaKey, index, fieldName } = fieldSpec;
      currentVal = formData[schemaKey]?.[index]?.[fieldName] || "";
    }
    const selectedDate = parseISODate(currentVal) ?? new Date();
    setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    setIsCalendarOpen(true);
  };

  const closeCalendar = () => {
    setIsCalendarOpen(false);
    setActiveDateField(null);
  };

  const selectCalendarDate = (date) => {
    if (activeDateField) {
      if (typeof activeDateField === "string") {
        setFormData((prev) => ({
          ...prev,
          [activeDateField]: toISODate(date),
        }));
        if (activeDateField === "dateOfBirth") {
          setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
        }
      } else if (typeof activeDateField === "object") {
        const { schemaKey, index, fieldName } = activeDateField;
        setFormData((prev) => {
          const list = Array.isArray(prev[schemaKey]) ? [...prev[schemaKey]] : [];
          const current = list[index] || {};
          list[index] = { ...current, [fieldName]: toISODate(date) };
          return { ...prev, [schemaKey]: list };
        });
      }
    }
    setIsCalendarOpen(false);
    setActiveDateField(null);
  };

  const addSubschemaRecord = (schemaKey) => {
    const emptyItems = {
      diseases: { startDate: "", endDate: "", diagnosis: "", icdCode: "", doctor: "" },
      finalDiagnoses: { date: "", diagnosis: "", icdCode: "", primary: "1", doctorName: "", jobTitle: "", speciality: "" },
      radiationDoses: { date: "", researchType: "", effectiveDose: "", note: "" },
      legalRepresentatives: {
        lastName: "", firstName: "", middleName: "", isCurrent: false, birthday: "", gender: "",
        relationship: "", attitudeToPatient: "", documentOfAuthority: "", documentType: "",
        series: "", number: "", whenIssued: "", issuedBy: "", snils: "", address: "",
        addressType: "", tenant: "", subjectOfRussia: "", district: "", city: "",
        settlement: "", street: "", house: "", apartment: "", state: ""
      }
    };
    setFormData((prev) => ({
      ...prev,
      [schemaKey]: [...(prev[schemaKey] || []), { ...emptyItems[schemaKey] }]
    }));
  };

  const removeSubschemaRecord = (schemaKey, index) => {
    setFormData((prev) => {
      const list = [...(prev[schemaKey] || [])];
      list.splice(index, 1);
      return { ...prev, [schemaKey]: list };
    });
  };

  const updateSubschemaField = (schemaKey, index, fieldName, value) => {
    setFormData((prev) => {
      const list = [...(prev[schemaKey] || [])];
      list[index] = { ...list[index], [fieldName]: value };
      return { ...prev, [schemaKey]: list };
    });
  };

  const goToPreviousMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const goToPreviousYear = () => {
    setCalendarMonth((current) => new Date(current.getFullYear() - 1, current.getMonth(), 1));
  };

  const goToNextYear = () => {
    setCalendarMonth((current) => new Date(current.getFullYear() + 1, current.getMonth(), 1));
  };

  const calendarCells = buildCalendarCells(calendarMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeDateValue = activeDateField ? formData[activeDateField] : "";
  const selectedDob = parseISODate(activeDateValue);

  const renderContent = () => {
    if (profileQuery.isLoading) {
      return (
        <EmptyState
          title={t("profile.loading", globalLang) || "Loading..."}
          message="Fetching patient profile from the backend."
        />
      );
    }

    if (profileQuery.isError) {
      return (
        <EmptyState
          title={t("profile.errors.general", globalLang) || "Error loading profile"}
          message="Could not load profile data."
          actionLabel="Retry"
          onAction={() => profileQuery.refetch()}
        />
      );
    }

    const patientId = profileQuery.data?.patientId ?? "";
    const displayPatientId = patientId
      ? (patientId.startsWith("СОФ/Мос/Пац-")
          ? `${t("profile.patientIdPrefix", globalLang)}${patientId.slice("СОФ/Мос/Пац-".length)}`
          : patientId)
      : t("common.not_set", globalLang) || "Not Set";

    const stats = [
      {
        label: "Total appointments made",
        value: String(profileQuery.data?.totalAppointmentsMade ?? 0),
      },
      {
        label: "Total amount paid",
        value: formatCurrencyCode(profileQuery.data?.totalAmountPaid ?? 0),
      },
      {
        label: "Appointments scheduled soon",
        value: String(profileQuery.data?.appointmentsScheduledSoon ?? 0),
      },
    ];

    const imageUrl = profileQuery.data?.profileFileId
      ? `${env.apiBaseUrl}/profile/image/${profileQuery.data.profileFileId}`
      : null;

    return (
      <View style={styles.formContainer}>
        {/* Profile Picture & Header Card */}
        <AppCard style={styles.profileHeaderCard}>
          <View style={styles.avatarWrapper}>
            <Pressable onPress={handleUploadImage} style={({ pressed }) => [pressed && styles.pressed]}>
              {imageUrl ? (
                <Image
                  source={{
                    uri: imageUrl,
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
                  }}
                  style={styles.avatarImage}
                  key={profileQuery.data?.profileFileId} // Force refresh on update
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color="#94A3B8" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Feather name="camera" size={14} color="#FFF" />
              </View>
            </Pressable>
          </View>
          <View style={styles.profileHeaderInfo}>
            <Text style={styles.profileHeaderName}>
              {`${formData.firstName || ""} ${formData.lastName || ""}`.trim() || t("profile_card.name", globalLang) || "Patient Name"}
            </Text>
            {formData.dateOfBirth ? (
              <Text style={styles.profileHeaderSub}>
                {t("profile.dateOfBirth", globalLang)}: {formData.dateOfBirth}
              </Text>
            ) : null}
            <Text style={styles.profileHeaderSub}>
              ID: {displayPatientId}
            </Text>
          </View>
        </AppCard>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Section 1: Basic Information */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("basicInfo")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.basicInfo && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="person-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.sections.basicInformation", globalLang)}</Text>
            <Feather
              name={expandedSections.basicInfo ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.basicInfo && (
            <View>
              <View style={styles.sectionDivider} />

              <View style={styles.fieldsBlock}>
            <LocalFormInput
              label={t("profile.patientId", globalLang)}
              value={displayPatientId}
              disabled={true}
              leftIcon="hash"
            />

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={`${t("profile.firstName", globalLang)} *`}
                  value={formData.firstName}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, firstName: val }))}
                  placeholder={t("profile.firstNamePlaceholder", globalLang) || "First Name"}
                  leftIcon="user"
                  error={errors.firstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.middleName", globalLang)}
                  value={formData.middleName}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, middleName: val }))}
                  placeholder={t("profile.middleNamePlaceholder", globalLang) || "Middle Name"}
                  leftIcon="user"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={`${t("profile.lastName", globalLang)} *`}
                  value={formData.lastName}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, lastName: val }))}
                  placeholder={t("profile.lastNamePlaceholder", globalLang) || "Last Name"}
                  leftIcon="user"
                  error={errors.lastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridHalf}>
                <SegmentedControl
                  label={`${t("profile.gender", globalLang)} *`}
                  value={formData.gender}
                  options={[
                    { value: "Male", label: t("profile.genderMale", globalLang) || "Male" },
                    { value: "Female", label: t("profile.genderFemale", globalLang) || "Female" },
                    { value: "Other", label: t("profile.genderOther", globalLang) || "Other" },
                  ]}
                  onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
                />
              </View>
              <View style={styles.gridHalf}>
                <CalendarInput
                  label={`${t("profile.dateOfBirth", globalLang)} *`}
                  value={formData.dateOfBirth}
                  onPress={() => openCalendar("dateOfBirth")}
                  error={errors.dateOfBirth}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridHalf}>
                <LocalFormInput
                  label={t("profile.email", globalLang)}
                  value={user?.email ?? formData.email}
                  disabled={true}
                  leftIcon="mail"
                />
              </View>
              <View style={styles.gridHalf}>
                <SegmentedControl
                  label={t("profile.notificationLanguage", globalLang)}
                  value={formData.notificationLanguage}
                  options={[
                    { value: "en", label: "English" },
                    { value: "ru", label: "Русский" },
                  ]}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, notificationLanguage: val }));
                    handleLanguageToggle(val);
                  }}
                />
              </View>
            </View>
            </View>
            </View>
          )}
        </AppCard>

        {/* Section 2: Contacts */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("contacts")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.contacts && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="call-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.sections.contacts", globalLang)}</Text>
            <Feather
              name={expandedSections.contacts ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.contacts && (
            <View>
              <View style={styles.sectionDivider} />

              <View style={styles.fieldsBlock}>
            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <PhoneInput
                  label={`${t("profile.phoneNumber", globalLang)} *`}
                  value={formData.phoneNumber}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, phoneNumber: val }))}
                  placeholder="Enter number"
                  error={errors.phoneNumber}
                />
              </View>
              <View style={styles.gridThird}>
                <PhoneInput
                  label={t("profile.additionalPhone", globalLang)}
                  value={formData.additionalPhone}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, additionalPhone: val }))}
                  placeholder="Enter number"
                  error={errors.additionalPhone}
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.contactPerson", globalLang)}
                  value={formData.contactPerson}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, contactPerson: val }))}
                  placeholder="Emergency contact name"
                  leftIcon="user"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <PhoneInput
                  label={t("profile.contactPersonPhone", globalLang)}
                  value={formData.contactPersonPhone}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, contactPersonPhone: val }))}
                  placeholder="Enter number"
                  error={errors.contactPersonPhone}
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.maxId", globalLang)}
                  value={formData.maxId}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, maxId: val }))}
                  placeholder="MAX ID"
                  leftIcon="hash"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.telegramNickname", globalLang)}
                  value={formData.telegramNickname}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, telegramNickname: val }))}
                  placeholder="Telegram nickname"
                  leftIcon="send"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.telegramId", globalLang)}
                  value={formData.telegramId}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, telegramId: val }))}
                  placeholder="Telegram ID"
                  leftIcon="send"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.instagram", globalLang)}
                  value={formData.instagram}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, instagram: val }))}
                  placeholder="Instagram"
                  leftIcon="instagram"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.vk", globalLang)}
                  value={formData.vk}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, vk: val }))}
                  placeholder="VK"
                  leftIcon="globe"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.facebook", globalLang)}
                  value={formData.facebook}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, facebook: val }))}
                  placeholder="Facebook"
                  leftIcon="facebook"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.ok", globalLang)}
                  value={formData.ok}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, ok: val }))}
                  placeholder="Odnoklassniki"
                  leftIcon="globe"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridHalf}>
                <FormCheckbox
                  label={t("profile.subscribedToNewsletter", globalLang)}
                  value={formData.newsletter}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, newsletter: val }))}
                />
              </View>
              <View style={styles.gridHalf}>
                <FormCheckbox
                  label={t("profile.egiszEnabled", globalLang)}
                  value={formData.egisz}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, egisz: val }))}
                />
              </View>
            </View>
            </View>
            </View>
          )}
        </AppCard>

        {/* Section 3: Documents */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("documents")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.documents && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="document-text-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.sections.documents", globalLang)}</Text>
            <Feather
              name={expandedSections.documents ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.documents && (
            <View>
              <View style={styles.sectionDivider} />

              <View style={styles.fieldsBlock}>
            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.cmip", globalLang)}
                  value={formData.cmip}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, cmip: val }))}
                  placeholder="CMIP"
                  leftIcon="file-text"
                />
              </View>
              <View style={styles.gridThird}>
                <CalendarInput
                  label={t("profile.cmipDate", globalLang)}
                  value={formData.cmipDate}
                  onPress={() => openCalendar("cmipDate")}
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.cmipOrgCode", globalLang)}
                  value={formData.cmipOrgCode}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, cmipOrgCode: val }))}
                  placeholder="Organization Code"
                  leftIcon="hash"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.snils", globalLang)}
                  value={formData.snils}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, snils: val }))}
                  placeholder="SNILS"
                  leftIcon="file-text"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.medInsuranceOrg", globalLang)}
                  value={formData.medInsuranceOrg}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, medInsuranceOrg: val }))}
                  placeholder="Insurance Organization"
                  leftIcon="shield"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.socialSupportCode", globalLang)}
                  value={formData.socialSupportCode}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, socialSupportCode: val }))}
                  placeholder="Support Code"
                  leftIcon="hash"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.citizenship", globalLang)}
                  value={formData.citizenship}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, citizenship: val }))}
                  placeholder="Citizenship"
                  leftIcon="globe"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.documentType", globalLang)}
                  value={formData.documentType}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, documentType: val }))}
                  placeholder="Document Type"
                  leftIcon="file"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.documentSeries", globalLang)}
                  value={formData.documentSeries}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, documentSeries: val }))}
                  placeholder="Document Series"
                  leftIcon="file-text"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.documentNumber", globalLang)}
                  value={formData.documentNumber}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, documentNumber: val }))}
                  placeholder="Document Number"
                  leftIcon="hash"
                />
              </View>
              <View style={styles.gridThird}>
                <CalendarInput
                  label={t("profile.documentIssuedDate", globalLang)}
                  value={formData.documentIssuedDate}
                  onPress={() => openCalendar("documentIssuedDate")}
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.departmentCode", globalLang)}
                  value={formData.departmentCode}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, departmentCode: val }))}
                  placeholder="Department Code"
                  leftIcon="hash"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.documentIssuedBy", globalLang)}
                  value={formData.documentIssuedBy}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, documentIssuedBy: val }))}
                  placeholder="Issued By"
                  leftIcon="edit"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.inn", globalLang)}
                  value={formData.inn}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, inn: val }))}
                  placeholder="INN"
                  leftIcon="hash"
                />
              </View>
            </View>
            </View>
            </View>
          )}
        </AppCard>

        {/* Section 4: Address */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("address")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.address && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="map-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.sections.address", globalLang)}</Text>
            <Feather
              name={expandedSections.address ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.address && (
            <View>
              <View style={styles.sectionDivider} />

              <View style={styles.fieldsBlock}>
            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.addressType", globalLang)}
                  value={formData.addressType}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, addressType: val }))}
                  placeholder="Address Type"
                  leftIcon="map-pin"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.region", globalLang)}
                  value={formData.region}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, region: val }))}
                  placeholder="Region"
                  leftIcon="map"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.district", globalLang)}
                  value={formData.district}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, district: val }))}
                  placeholder="District"
                  leftIcon="map"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.city", globalLang)}
                  value={formData.city}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, city: val }))}
                  placeholder="City"
                  leftIcon="home"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.settlement", globalLang)}
                  value={formData.settlement}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, settlement: val }))}
                  placeholder="Settlement"
                  leftIcon="home"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.street", globalLang)}
                  value={formData.street}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, street: val }))}
                  placeholder="Street"
                  leftIcon="map-pin"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.house", globalLang)}
                  value={formData.house}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, house: val }))}
                  placeholder="House"
                  leftIcon="home"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.terrain", globalLang)}
                  value={formData.terrain}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, terrain: val }))}
                  placeholder="Terrain"
                  leftIcon="map"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.apartment", globalLang)}
                  value={formData.apartment}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, apartment: val }))}
                  placeholder="Apartment"
                  leftIcon="home"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.postcode", globalLang)}
                  value={formData.postcode}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, postcode: val }))}
                  placeholder="Postcode"
                  leftIcon="hash"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.geocoordinates", globalLang)}
                  value={formData.geocoordinates}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, geocoordinates: val }))}
                  placeholder="Geocoordinates"
                  leftIcon="map"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.registrationChange", globalLang)}
                  value={formData.registrationChange}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, registrationChange: val }))}
                  placeholder="Registration Change"
                  leftIcon="edit"
                />
              </View>
            </View>
            </View>
            </View>
          )}
        </AppCard>

        {/* Section 5: Personal Data */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("personalData")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.personalData && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="heart-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.sections.personalData", globalLang)}</Text>
            <Feather
              name={expandedSections.personalData ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.personalData && (
            <View>
              <View style={styles.sectionDivider} />

              <View style={styles.fieldsBlock}>
            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.maritalStatus", globalLang)}
                  value={formData.maritalStatus}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, maritalStatus: val }))}
                  placeholder="Marital Status"
                  leftIcon="heart"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.education", globalLang)}
                  value={formData.education}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, education: val }))}
                  placeholder="Education"
                  leftIcon="book"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.employment", globalLang)}
                  value={formData.employment}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, employment: val }))}
                  placeholder="Employment"
                  leftIcon="briefcase"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.placeOfWork", globalLang)}
                  value={formData.placeOfWork}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, placeOfWork: val }))}
                  placeholder="Place of Work"
                  leftIcon="briefcase"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.workSpecialty", globalLang)}
                  value={formData.workSpecialty}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, workSpecialty: val }))}
                  placeholder="Work Specialty"
                  leftIcon="briefcase"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.changePlaceOfWork", globalLang)}
                  value={formData.changePlaceOfWork}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, changePlaceOfWork: val }))}
                  placeholder="Change Place of Work"
                  leftIcon="edit"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.changeOfPosition", globalLang)}
                  value={formData.changeOfPosition}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, changeOfPosition: val }))}
                  placeholder="Change of Position"
                  leftIcon="edit"
                />
              </View>
            </View>
            </View>
            </View>
          )}
        </AppCard>

        {/* Section 6: Disability */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("disability")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.disability && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="shield-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.sections.disability", globalLang)}</Text>
            <Feather
              name={expandedSections.disability ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.disability && (
            <View>
              <View style={styles.sectionDivider} />

              <View style={styles.fieldsBlock}>
            <View style={styles.gridRow}>
              <View style={styles.gridHalf}>
                <SegmentedControl
                  label={t("profile.disability", globalLang)}
                  value={formData.disability}
                  options={[
                    { value: "", label: "Not Set" },
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                  ]}
                  onChange={(val) => setFormData((prev) => ({ ...prev, disability: val }))}
                />
              </View>
              <View style={styles.gridHalf}>
                <CalendarInput
                  label={t("profile.disabilityFrom", globalLang)}
                  value={formData.disabilityFrom}
                  onPress={() => openCalendar("disabilityFrom")}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridHalf}>
                <CalendarInput
                  label={t("profile.disabilityTo", globalLang)}
                  value={formData.disabilityTo}
                  onPress={() => openCalendar("disabilityTo")}
                />
              </View>
              <View style={styles.gridHalf}>
                <FormCheckbox
                  label={t("profile.disabilityIndefinitely", globalLang)}
                  value={formData.disabilityIndefinitely}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, disabilityIndefinitely: val }))}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.invalidGroup", globalLang)}
                  value={formData.invalidGroup}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, invalidGroup: val }))}
                  placeholder="Invalid Group"
                  leftIcon="users"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.disabilityType", globalLang)}
                  value={formData.disabilityType}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, disabilityType: val }))}
                  placeholder="Disability Type"
                  leftIcon="file-text"
                />
              </View>
              <View style={styles.gridThird}>
                <LocalFormInput
                  label={t("profile.disabilityPrimaryRepeated", globalLang)}
                  value={formData.disabilityPrimaryRepeated}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, disabilityPrimaryRepeated: val }))}
                  placeholder="Primary/Repeated"
                  leftIcon="edit"
                />
              </View>
            </View>
            </View>
            </View>
          )}
        </AppCard>

        {/* Section 7: Disease Records */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("diseases")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.diseases && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="medical-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.diseaseRecords.title", globalLang)}</Text>
            <Feather
              name={expandedSections.diseases ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.diseases && (
            <View>
              <View style={styles.sectionDivider} />
              <View style={styles.fieldsBlock}>
                {(!formData.diseases || formData.diseases.length === 0) ? (
                  <Text style={styles.noRecordsText}>{t("profile.common.noRecordsAddedYet", globalLang)}</Text>
                ) : (
                  formData.diseases.map((record, index) => (
                    <View key={index} style={styles.subRecordCard}>
                      <View style={styles.subCardHeader}>
                        <Text style={styles.subCardTitle}>
                          {t("profile.diseaseRecords.title", globalLang)} #{index + 1}
                        </Text>
                        <Pressable onPress={() => removeSubschemaRecord("diseases", index)} style={styles.subCardRemoveBtn}>
                          <Feather name="trash-2" size={14} color="#EF4444" />
                          <Text style={styles.subCardRemoveText}>{t("profile.common.remove", globalLang)}</Text>
                        </Pressable>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <CalendarInput
                            label={t("profile.diseaseRecords.startDate", globalLang)}
                            value={record.startDate}
                            onPress={() => openCalendar({ schemaKey: "diseases", index, fieldName: "startDate" })}
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <CalendarInput
                            label={t("profile.diseaseRecords.endDate", globalLang)}
                            value={record.endDate}
                            onPress={() => openCalendar({ schemaKey: "diseases", index, fieldName: "endDate" })}
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.diseaseRecords.diagnosis", globalLang)}
                            value={record.diagnosis}
                            onChangeText={(val) => updateSubschemaField("diseases", index, "diagnosis", val)}
                            placeholder="Diagnosis"
                            leftIcon="activity"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.diseaseRecords.icdCode", globalLang)}
                            value={record.icdCode}
                            onChangeText={(val) => updateSubschemaField("diseases", index, "icdCode", val)}
                            placeholder="ICD Code"
                            leftIcon="hash"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.diseaseRecords.doctor", globalLang)}
                            value={record.doctor}
                            onChangeText={(val) => updateSubschemaField("diseases", index, "doctor", val)}
                            placeholder="Doctor"
                            leftIcon="user"
                          />
                        </View>
                      </View>
                    </View>
                  ))
                )}
                <Pressable onPress={() => addSubschemaRecord("diseases")} style={styles.addBtn}>
                  <Feather name="plus" size={16} color="#0F4C81" />
                  <Text style={styles.addBtnText}>
                    {t("profile.common.add", globalLang)} {t("profile.diseaseRecords.title", globalLang)}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </AppCard>

        {/* Section 8: Final Diagnosis Records */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("finalDiagnoses")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.finalDiagnoses && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="ribbon-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.finalDiagnosisRecords.title", globalLang)}</Text>
            <Feather
              name={expandedSections.finalDiagnoses ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.finalDiagnoses && (
            <View>
              <View style={styles.sectionDivider} />
              <View style={styles.fieldsBlock}>
                {(!formData.finalDiagnoses || formData.finalDiagnoses.length === 0) ? (
                  <Text style={styles.noRecordsText}>{t("profile.common.noRecordsAddedYet", globalLang)}</Text>
                ) : (
                  formData.finalDiagnoses.map((record, index) => (
                    <View key={index} style={styles.subRecordCard}>
                      <View style={styles.subCardHeader}>
                        <Text style={styles.subCardTitle}>
                          {t("profile.finalDiagnosisRecords.title", globalLang)} #{index + 1}
                        </Text>
                        <Pressable onPress={() => removeSubschemaRecord("finalDiagnoses", index)} style={styles.subCardRemoveBtn}>
                          <Feather name="trash-2" size={14} color="#EF4444" />
                          <Text style={styles.subCardRemoveText}>{t("profile.common.remove", globalLang)}</Text>
                        </Pressable>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <CalendarInput
                            label={t("profile.finalDiagnosisRecords.date", globalLang)}
                            value={record.date}
                            onPress={() => openCalendar({ schemaKey: "finalDiagnoses", index, fieldName: "date" })}
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <SegmentedControl
                            label={t("profile.finalDiagnosisRecords.primary", globalLang)}
                            value={record.primary}
                            options={[
                              { value: "1", label: t("profile.common.primary", globalLang) || "Primary" },
                              { value: "2", label: t("profile.common.secondary", globalLang) || "Secondary" },
                            ]}
                            onChange={(val) => updateSubschemaField("finalDiagnoses", index, "primary", val)}
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.finalDiagnosisRecords.diagnosis", globalLang)}
                            value={record.diagnosis}
                            onChangeText={(val) => updateSubschemaField("finalDiagnoses", index, "diagnosis", val)}
                            placeholder="Diagnosis"
                            leftIcon="award"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.finalDiagnosisRecords.icdCode", globalLang)}
                            value={record.icdCode}
                            onChangeText={(val) => updateSubschemaField("finalDiagnoses", index, "icdCode", val)}
                            placeholder="ICD Code"
                            leftIcon="hash"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.finalDiagnosisRecords.doctorName", globalLang)}
                            value={record.doctorName}
                            onChangeText={(val) => updateSubschemaField("finalDiagnoses", index, "doctorName", val)}
                            placeholder="Doctor Name"
                            leftIcon="user"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.finalDiagnosisRecords.jobTitle", globalLang)}
                            value={record.jobTitle}
                            onChangeText={(val) => updateSubschemaField("finalDiagnoses", index, "jobTitle", val)}
                            placeholder="Job Title"
                            leftIcon="briefcase"
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.finalDiagnosisRecords.speciality", globalLang)}
                            value={record.speciality}
                            onChangeText={(val) => updateSubschemaField("finalDiagnoses", index, "speciality", val)}
                            placeholder="Speciality"
                            leftIcon="activity"
                          />
                        </View>
                      </View>
                    </View>
                  ))
                )}
                <Pressable onPress={() => addSubschemaRecord("finalDiagnoses")} style={styles.addBtn}>
                  <Feather name="plus" size={16} color="#0F4C81" />
                  <Text style={styles.addBtnText}>
                    {t("profile.common.add", globalLang)} {t("profile.finalDiagnosisRecords.title", globalLang)}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </AppCard>

        {/* Section 9: Radiation Dose Records */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("radiationDoses")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.radiationDoses && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="pulse-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.radiationDoseRecords.title", globalLang)}</Text>
            <Feather
              name={expandedSections.radiationDoses ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.radiationDoses && (
            <View>
              <View style={styles.sectionDivider} />
              <View style={styles.fieldsBlock}>
                {(!formData.radiationDoses || formData.radiationDoses.length === 0) ? (
                  <Text style={styles.noRecordsText}>{t("profile.common.noRecordsAddedYet", globalLang)}</Text>
                ) : (
                  formData.radiationDoses.map((record, index) => (
                    <View key={index} style={styles.subRecordCard}>
                      <View style={styles.subCardHeader}>
                        <Text style={styles.subCardTitle}>
                          {t("profile.radiationDoseRecords.title", globalLang)} #{index + 1}
                        </Text>
                        <Pressable onPress={() => removeSubschemaRecord("radiationDoses", index)} style={styles.subCardRemoveBtn}>
                          <Feather name="trash-2" size={14} color="#EF4444" />
                          <Text style={styles.subCardRemoveText}>{t("profile.common.remove", globalLang)}</Text>
                        </Pressable>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <CalendarInput
                            label={t("profile.radiationDoseRecords.date", globalLang)}
                            value={record.date}
                            onPress={() => openCalendar({ schemaKey: "radiationDoses", index, fieldName: "date" })}
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.radiationDoseRecords.effectiveDose", globalLang)}
                            value={record.effectiveDose}
                            onChangeText={(val) => updateSubschemaField("radiationDoses", index, "effectiveDose", val)}
                            placeholder="Effective Dose"
                            leftIcon="hash"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.radiationDoseRecords.researchType", globalLang)}
                            value={record.researchType}
                            onChangeText={(val) => updateSubschemaField("radiationDoses", index, "researchType", val)}
                            placeholder="Research Type"
                            leftIcon="search"
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.radiationDoseRecords.note", globalLang)}
                            value={record.note}
                            onChangeText={(val) => updateSubschemaField("radiationDoses", index, "note", val)}
                            placeholder="Note"
                            leftIcon="file-text"
                          />
                        </View>
                      </View>
                    </View>
                  ))
                )}
                <Pressable onPress={() => addSubschemaRecord("radiationDoses")} style={styles.addBtn}>
                  <Feather name="plus" size={16} color="#0F4C81" />
                  <Text style={styles.addBtnText}>
                    {t("profile.common.add", globalLang)} {t("profile.radiationDoseRecords.title", globalLang)}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </AppCard>

        {/* Section 10: Legal Representatives */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("legalRepresentatives")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.legalRepresentatives && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="people-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.legalRepresentatives.title", globalLang)}</Text>
            <Feather
              name={expandedSections.legalRepresentatives ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.legalRepresentatives && (
            <View>
              <View style={styles.sectionDivider} />
              <View style={styles.fieldsBlock}>
                {(!formData.legalRepresentatives || formData.legalRepresentatives.length === 0) ? (
                  <Text style={styles.noRecordsText}>{t("profile.common.noRecordsAddedYet", globalLang)}</Text>
                ) : (
                  formData.legalRepresentatives.map((record, index) => (
                    <View key={index} style={styles.subRecordCard}>
                      <View style={styles.subCardHeader}>
                        <Text style={styles.subCardTitle}>
                          {t("profile.legalRepresentatives.title", globalLang)} #{index + 1}
                        </Text>
                        <Pressable onPress={() => removeSubschemaRecord("legalRepresentatives", index)} style={styles.subCardRemoveBtn}>
                          <Feather name="trash-2" size={14} color="#EF4444" />
                          <Text style={styles.subCardRemoveText}>{t("profile.common.remove", globalLang)}</Text>
                        </Pressable>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.lastName", globalLang)}
                            value={record.lastName}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "lastName", val)}
                            placeholder="Last Name"
                            leftIcon="user"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.firstName", globalLang)}
                            value={record.firstName}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "firstName", val)}
                            placeholder="First Name"
                            leftIcon="user"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.middleName", globalLang)}
                            value={record.middleName}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "middleName", val)}
                            placeholder="Middle Name"
                            leftIcon="user"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <CalendarInput
                            label={t("profile.legalRepresentatives.birthday", globalLang)}
                            value={record.birthday}
                            onPress={() => openCalendar({ schemaKey: "legalRepresentatives", index, fieldName: "birthday" })}
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <SegmentedControl
                            label={t("profile.legalRepresentatives.gender", globalLang)}
                            value={record.gender}
                            options={[
                              { value: "", label: t("profile.common.notSet", globalLang) || "Not Set" },
                              { value: "Male", label: t("profile.genderMale", globalLang) || "Male" },
                              { value: "Female", label: t("profile.genderFemale", globalLang) || "Female" },
                              { value: "Other", label: t("profile.genderOther", globalLang) || "Other" }
                            ]}
                            onChange={(val) => updateSubschemaField("legalRepresentatives", index, "gender", val)}
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <FormCheckbox
                            label={t("profile.legalRepresentatives.isCurrent", globalLang)}
                            value={record.isCurrent}
                            onValueChange={(val) => updateSubschemaField("legalRepresentatives", index, "isCurrent", val)}
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.relationship", globalLang)}
                            value={record.relationship}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "relationship", val)}
                            placeholder="Relationship"
                            leftIcon="git-merge"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.attitudeToPatient", globalLang)}
                            value={record.attitudeToPatient}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "attitudeToPatient", val)}
                            placeholder="Attitude to Patient"
                            leftIcon="smile"
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.documentOfAuthority", globalLang)}
                            value={record.documentOfAuthority}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "documentOfAuthority", val)}
                            placeholder="Document of Authority"
                            leftIcon="file-text"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.documentType", globalLang)}
                            value={record.documentType}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "documentType", val)}
                            placeholder="Document Type"
                            leftIcon="file-text"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.series", globalLang)}
                            value={record.series}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "series", val)}
                            placeholder="Series"
                            leftIcon="hash"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.number", globalLang)}
                            value={record.number}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "number", val)}
                            placeholder="Number"
                            leftIcon="hash"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridThird}>
                          <CalendarInput
                            label={t("profile.legalRepresentatives.whenIssued", globalLang)}
                            value={record.whenIssued}
                            onPress={() => openCalendar({ schemaKey: "legalRepresentatives", index, fieldName: "whenIssued" })}
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.issuedBy", globalLang)}
                            value={record.issuedBy}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "issuedBy", val)}
                            placeholder="Issued By"
                            leftIcon="edit"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.snils", globalLang)}
                            value={record.snils}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "snils", val)}
                            placeholder="SNILS"
                            leftIcon="file-text"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.addressType", globalLang)}
                            value={record.addressType}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "addressType", val)}
                            placeholder="Address Type"
                            leftIcon="map-pin"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.address", globalLang)}
                            value={record.address}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "address", val)}
                            placeholder="Address"
                            leftIcon="map-pin"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.tenant", globalLang)}
                            value={record.tenant}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "tenant", val)}
                            placeholder="Tenant"
                            leftIcon="home"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.subjectOfRussia", globalLang)}
                            value={record.subjectOfRussia}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "subjectOfRussia", val)}
                            placeholder="Subject of Russia"
                            leftIcon="map"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.district", globalLang)}
                            value={record.district}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "district", val)}
                            placeholder="District"
                            leftIcon="map"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.city", globalLang)}
                            value={record.city}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "city", val)}
                            placeholder="City"
                            leftIcon="home"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.settlement", globalLang)}
                            value={record.settlement}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "settlement", val)}
                            placeholder="Settlement"
                            leftIcon="home"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.street", globalLang)}
                            value={record.street}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "street", val)}
                            placeholder="Street"
                            leftIcon="map-pin"
                          />
                        </View>
                        <View style={styles.gridThird}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.house", globalLang)}
                            value={record.house}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "house", val)}
                            placeholder="House"
                            leftIcon="home"
                          />
                        </View>
                      </View>

                      <View style={styles.gridRow}>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.apartment", globalLang)}
                            value={record.apartment}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "apartment", val)}
                            placeholder="Apartment"
                            leftIcon="home"
                          />
                        </View>
                        <View style={styles.gridHalf}>
                          <LocalFormInput
                            label={t("profile.legalRepresentatives.state", globalLang)}
                            value={record.state}
                            onChangeText={(val) => updateSubschemaField("legalRepresentatives", index, "state", val)}
                            placeholder="State"
                            leftIcon="map"
                          />
                        </View>
                      </View>
                    </View>
                  ))
                )}
                <Pressable onPress={() => addSubschemaRecord("legalRepresentatives")} style={styles.addBtn}>
                  <Feather name="plus" size={16} color="#0F4C81" />
                  <Text style={styles.addBtnText}>
                    {t("profile.common.add", globalLang)} {t("profile.legalRepresentatives.title", globalLang)}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </AppCard>

        {/* Section 11: Additional Notes */}
        <AppCard style={styles.sectionCard}>
          <Pressable
            onPress={() => toggleSection("additionalNotes")}
            style={({ pressed }) => [
              styles.sectionHeaderRow,
              expandedSections.additionalNotes && styles.sectionHeaderRowExpanded,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.sectionIconShell}>
              <Ionicons name="document-text-outline" size={18} color="#0F4C81" />
            </View>
            <Text style={styles.sectionTitle}>{t("profile.sections.additionalNotes", globalLang)}</Text>
            <Feather
              name={expandedSections.additionalNotes ? "chevron-down" : "chevron-right"}
              size={18}
              color="#64748B"
            />
          </Pressable>

          {expandedSections.additionalNotes && (
            <View>
              <View style={styles.sectionDivider} />
              <View style={styles.fieldsBlock}>
                <View style={styles.gridRow}>
                  <View style={{ width: "100%", gap: 12 }}>
                    <LocalFormInput
                      label={t("profile.notes", globalLang)}
                      value={formData.notes}
                      onChangeText={(val) => setFormData((prev) => ({ ...prev, notes: val }))}
                      placeholder="Notes"
                      leftIcon="file-text"
                      multiline
                    />
                    <LocalFormInput
                      label={t("profile.comments", globalLang)}
                      value={formData.comments}
                      onChangeText={(val) => setFormData((prev) => ({ ...prev, comments: val }))}
                      placeholder="Comments"
                      leftIcon="edit-3"
                      multiline
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </AppCard>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.pressed,
              isSubmitting && styles.btnDisabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <View style={styles.btnContent}>
                <Feather name="save" size={16} color="#FFF" />
                <Text style={styles.saveBtnText}>{t("profile.saveButton", globalLang) || "Save Changes"}</Text>
              </View>
            )}
          </Pressable>

          <AppButton
            title={t("profile.logout", globalLang) || "Sign out"}
            variant="secondary"
            onPress={handleSignOut}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      <Screen preventProfileBlock={true}>
        <SectionHeader
          title={t("profile.title", globalLang) || "Profile"}
          subtitle="Complete or update your patient portal records to ensure uninterrupted healthcare access."
        />
        {renderContent()}
      </Screen>

      <Modal transparent visible={isCalendarOpen} animationType="fade" onRequestClose={closeCalendar}>
        <View style={styles.calendarBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeCalendar} />

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View style={styles.calendarNavColumn}>
                <Pressable onPress={goToPreviousYear} style={styles.calendarNavButton}>
                  <Feather name="chevrons-left" size={18} color="#0F4C81" />
                </Pressable>
                <Pressable onPress={goToPreviousMonth} style={styles.calendarNavButton}>
                  <Feather name="chevron-left" size={18} color="#0F4C81" />
                </Pressable>
              </View>

              <View style={styles.calendarHeaderCenter}>
                <Text style={styles.calendarMonthLabel}>{formatCalendarHeader(calendarMonth)}</Text>
                <Text style={styles.calendarSubLabel}>Choose Date</Text>
              </View>

              <View style={styles.calendarNavColumn}>
                <Pressable onPress={goToNextMonth} style={styles.calendarNavButton}>
                  <Feather name="chevron-right" size={18} color="#0F4C81" />
                </Pressable>
                <Pressable onPress={goToNextYear} style={styles.calendarNavButton}>
                  <Feather name="chevrons-right" size={18} color="#0F4C81" />
                </Pressable>
              </View>
            </View>

            <View style={styles.weekdayRow}>
              {[
                { key: "sun", label: "S" },
                { key: "mon", label: "M" },
                { key: "tue", label: "T" },
                { key: "wed", label: "W" },
                { key: "thu", label: "T" },
                { key: "fri", label: "F" },
                { key: "sat", label: "S" },
              ].map((weekday) => (
                <Text key={weekday.key} style={styles.weekdayText}>
                  {weekday.label}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((date, index) => {
                if (!date) {
                  return <View key={`blank-${index}`} style={styles.calendarCell} />;
                }

                const isActive = selectedDob ? isSameCalendarDay(date, selectedDob) : false;
                const isDisabled = date > today && activeDateField === 'dateOfBirth';

                return (
                  <Pressable
                    key={date.toISOString()}
                    disabled={isDisabled}
                    onPress={() => selectCalendarDate(date)}
                    style={({ pressed }) => [
                      styles.calendarCell,
                      isActive && styles.calendarCellActive,
                      isDisabled && styles.calendarCellDisabled,
                      pressed && !isDisabled && styles.calendarCellPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarCellText,
                        isActive && styles.calendarCellTextActive,
                        isDisabled && styles.calendarCellTextDisabled,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.calendarActions}>
              <Pressable
                onPress={() => {
                  if (activeDateField) {
                    if (typeof activeDateField === "string") {
                      setFormData((prev) => ({ ...prev, [activeDateField]: "" }));
                      if (activeDateField === "dateOfBirth") {
                        setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                      }
                    } else if (typeof activeDateField === "object") {
                      const { schemaKey, index, fieldName } = activeDateField;
                      setFormData((prev) => {
                        const list = Array.isArray(prev[schemaKey]) ? [...prev[schemaKey]] : [];
                        const current = list[index] || {};
                        list[index] = { ...current, [fieldName]: "" };
                        return { ...prev, [schemaKey]: list };
                      });
                    }
                  }
                  closeCalendar();
                }}
                style={styles.calendarActionSecondary}
              >
                <Text style={styles.calendarActionSecondaryText}>Clear</Text>
              </Pressable>
              <Pressable onPress={closeCalendar} style={styles.calendarActionPrimary}>
                <Text style={styles.calendarActionPrimaryText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    gap: spacing.md,
    paddingBottom: 80,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    minWidth: 180,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: "0 12px 24px rgba(15, 76, 129, 0.08)",
      },
      default: {
        shadowColor: "#0F4C81",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      },
    }),
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    gap: 0,
    padding: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionHeaderRowExpanded: {
    paddingBottom: spacing.md,
  },
  sectionIconShell: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(15, 76, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E8EEF5",
    marginBottom: spacing.md,
  },
  fieldsBlock: {
    gap: 16,
  },
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
  calendarWrapper: {
    paddingRight: 16,
    justifyContent: "space-between",
  },
  calendarPressed: {
    opacity: 0.95,
  },
  calendarValue: {
    flex: 1,
    fontSize: 14,
    color: "#10233F",
    paddingHorizontal: 18,
    fontWeight: "600",
  },
  calendarPlaceholder: {
    color: "#94A3B8",
  },
  inputLeftIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
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
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridThird: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 180,
  },
  gridHalf: {
    flexGrow: 1,
    flexBasis: 320,
    minWidth: 240,
  },
  segmentedContainer: {
    gap: 8,
  },
  segmentedLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingLeft: 2,
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(15, 76, 129, 0.06)",
      },
      default: {
        shadowColor: "#0F4C81",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    }),
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  segmentTextActive: {
    color: "#0F4C81",
    fontWeight: "800",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    gap: 10,
    paddingLeft: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  actionsContainer: {
    gap: 12,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  saveBtn: {
    width: "100%",
    backgroundColor: "#007bff",
    borderRadius: 18,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 10px 24px rgba(0, 123, 255, 0.22)",
      },
      default: {
        shadowColor: "#007bff",
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 4,
      },
    }),
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnDisabled: {
    backgroundColor: "#CBD5E1",
    ...Platform.select({
      web: {
        boxShadow: "none",
      },
      default: {
        shadowColor: "transparent",
        elevation: 0,
      },
    }),
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  calendarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 13, 22, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  calendarCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: "0 24px 60px rgba(9, 13, 22, 0.24)",
      },
      default: {
        shadowColor: "#0F4C81",
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        elevation: 8,
      },
    }),
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: spacing.md,
  },
  calendarNavColumn: {
    gap: 8,
  },
  calendarHeaderCenter: {
    flex: 1,
    alignItems: "center",
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  calendarMonthLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  calendarSubLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    marginTop: 2,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginBottom: 4,
  },
  calendarCellActive: {
    backgroundColor: "#0F4C81",
  },
  calendarCellDisabled: {
    opacity: 0.28,
  },
  calendarCellPressed: {
    backgroundColor: "rgba(15, 76, 129, 0.08)",
  },
  calendarCellText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  calendarCellTextActive: {
    color: "#FFFFFF",
  },
  calendarCellTextDisabled: {
    color: colors.muted,
  },
  calendarActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.md,
  },
  calendarActionSecondary: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarActionSecondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  calendarActionPrimary: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarActionPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  // Profile Picture Card Styles
  profileHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0F4C81",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  profileHeaderName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  profileHeaderSub: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },

  // Subschema Card Styles
  subRecordCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: spacing.md,
    gap: 16,
    marginBottom: spacing.md,
  },
  subCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
  },
  subCardRemoveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  subCardRemoveText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#EF4444",
  },
  noRecordsText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
    textAlign: "center",
    marginVertical: 12,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#0F4C81",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: "rgba(15, 76, 129, 0.04)",
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F4C81",
  },
});
