import { router } from "expo-router";
import React from "react";
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
import { getFreeCount, parkingData } from "../data/parkingData";

export default function HomeScreen() {
  const totalFree =
    getFreeCount(parkingData[1]) +
    getFreeCount(parkingData[2]) +
    getFreeCount(parkingData[3]);

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
            <Text style={styles.floorInfoValue}>
              {getFreeCount(parkingData[1])} / 12 voľných
            </Text>
          </View>

          <View style={styles.floorInfoCard}>
            <Text style={styles.floorInfoTitle}>Poschodie 2</Text>
            <Text style={styles.floorInfoValue}>
              {getFreeCount(parkingData[2])} / 12 voľných
            </Text>
          </View>

          <View style={styles.floorInfoCard}>
            <Text style={styles.floorInfoTitle}>Poschodie 3</Text>
            <Text style={styles.floorInfoValue}>
              {getFreeCount(parkingData[3])} / 12 voľných
            </Text>
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
