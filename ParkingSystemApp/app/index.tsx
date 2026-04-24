import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import StatsCarousel from "../components/stats/StatsCarousel";
import { getFreeCount, getParkingData } from "../data/parkingData";
import { Spot } from "../types/parking";

export default function HomeScreen() {
  const [parkingData, setParkingData] = useState<Record<1 | 2 | 3, Spot[]> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParkingData = async () => {
      try {
        const data = await getParkingData();
        setParkingData(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    };

    loadParkingData();
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Chyba: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!parkingData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.loadingText}>Načítavam parkovanie...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const floor1Free = getFreeCount(parkingData[1]);
  const floor2Free = getFreeCount(parkingData[2]);
  const floor3Free = getFreeCount(parkingData[3]);
  const totalFree = floor1Free + floor2Free + floor3Free;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView nestedScrollEnabled contentContainerStyle={styles.container}>
        <Text style={styles.appTitle}>Smart Parking</Text>
        <Text style={styles.subtitle}>3-poschodový parkovací dom</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Voľné miesta</Text>
          <Text style={styles.summaryValue}>{totalFree} / 36</Text>
        </View>

        <View style={styles.floorInfoWrapper}>
          <View style={styles.floorInfoCard}>
            <Text style={styles.floorInfoTitle}>Poschodie 1</Text>
            <Text style={styles.floorInfoValue}>{floor1Free} / 12 voľných</Text>
          </View>

          <View style={styles.floorInfoCard}>
            <Text style={styles.floorInfoTitle}>Poschodie 2</Text>
            <Text style={styles.floorInfoValue}>{floor2Free} / 12 voľných</Text>
          </View>

          <View style={styles.floorInfoCard}>
            <Text style={styles.floorInfoTitle}>Poschodie 3</Text>
            <Text style={styles.floorInfoValue}>{floor3Free} / 12 voľných</Text>
          </View>
        </View>

        <Pressable
          style={styles.mainButton}
          onPress={() => router.push("/parking")}
        >
          <Text style={styles.mainButtonText}>Parkovacie miesta</Text>
        </Pressable>

        <StatsCarousel />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#4b5563",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
  },
  appTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 6,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
  },
  summaryLabel: {
    color: "#d1d5db",
    fontSize: 15,
    marginBottom: 8,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
  },
  floorInfoWrapper: {
    marginBottom: 20,
  },
  floorInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  floorInfoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  floorInfoValue: {
    fontSize: 15,
    color: "#4b5563",
  },
  mainButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  mainButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});