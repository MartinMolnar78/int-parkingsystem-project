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
import ParkingFloorMap from "../components/ParkingFloorMap";
import { getFreeCount, getParkingData } from "../data/parkingData";
import { Spot } from "../types/parking";

export default function ParkingScreen() {
  const [selectedFloor, setSelectedFloor] = useState<1 | 2 | 3>(1);
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

    const interval = setInterval(loadParkingData, 5000);
    return () => clearInterval(interval);
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
          <Text style={styles.loadingText}>Načítavam parkovacie miesta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSpots = parkingData[selectedFloor];
  const freeCount = getFreeCount(currentSpots);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Späť</Text>
          </Pressable>
        </View>

        <Text style={styles.screenTitle}>Parkovacie miesta</Text>
        <Text style={styles.screenSubtitle}>
          Poschodie {selectedFloor} • {freeCount} / 12 voľných
        </Text>

        <View style={styles.floorSelector}>
          {[1, 2, 3].map((floor) => {
            const isActive = selectedFloor === floor;

            return (
              <Pressable
                key={floor}
                style={[
                  styles.floorButton,
                  isActive && styles.floorButtonActive,
                ]}
                onPress={() => setSelectedFloor(floor as 1 | 2 | 3)}
              >
                <Text
                  style={[
                    styles.floorButtonText,
                    isActive && styles.floorButtonTextActive,
                  ]}
                >
                  Poschodie {floor}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#22c55e" }]}
            />
            <Text style={styles.legendText}>Voľné</Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#ef4444" }]}
            />
            <Text style={styles.legendText}>Obsadené</Text>
          </View>
        </View>

        <ParkingFloorMap floor={selectedFloor} spots={currentSpots} />
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
  headerRow: {
    marginBottom: 8,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },
  screenSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 6,
    marginBottom: 16,
  },
  floorSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  floorButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },
  floorButtonActive: {
    backgroundColor: "#2563eb",
  },
  floorButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
  floorButtonTextActive: {
    color: "#ffffff",
  },
  legendRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },
  legendColor: {
    width: 18,
    height: 18,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
});