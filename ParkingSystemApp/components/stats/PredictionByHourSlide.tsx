import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HOURS } from "../../data/historicalStats";
import { getPredictionsForHour } from "../../data/predictionData";
import { FloorPrediction, ParkingFloor } from "../../types/prediction";
import { HourValue } from "../../types/stats";

const FLOOR_PAGE_HEIGHT = 380;

export default function PredictionByHourSlide() {
  const [selectedHour, setSelectedHour] = useState<HourValue>(8);
  const [activeFloor, setActiveFloor] = useState<ParkingFloor>(1);
  const [predictions, setPredictions] = useState<FloorPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const floorScrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getPredictionsForHour(selectedHour);
        setPredictions(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [selectedHour]);

  const currentFloorPrediction = useMemo(() => {
    return predictions.find((item) => item.floor === activeFloor) ?? null;
  }, [predictions, activeFloor]);

  const handleFloorScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / FLOOR_PAGE_HEIGHT);
    const nextFloor = (index + 1) as ParkingFloor;
    setActiveFloor(nextFloor);
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Predikcia voľných miest</Text>
        <Text style={styles.subtitle}>Načítavam predikcie...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Predikcia voľných miest</Text>
        <Text style={styles.subtitle}>Chyba: {error}</Text>
      </View>
    );
  }

  if (!currentFloorPrediction) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Predikcia voľných miest</Text>
        <Text style={styles.subtitle}>Predikcie sa nenašli.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Predikcia voľných miest</Text>
      <Text style={styles.subtitle}>
        Vyber čas a potiahni nižšie medzi poschodiami.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hoursRow}
      >
        {HOURS.map((hour) => {
          const isActive = selectedHour === hour;

          return (
            <Pressable
              key={hour}
              style={[styles.hourChip, isActive && styles.hourChipActive]}
              onPress={() => setSelectedHour(hour)}
            >
              <Text
                style={[
                  styles.hourChipText,
                  isActive && styles.hourChipTextActive,
                ]}
              >
                {hour}:00
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.floorPagerWrapper}>
        <ScrollView
          ref={floorScrollRef}
          nestedScrollEnabled
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleFloorScrollEnd}
        >
          {predictions.map((prediction) => (
            <View key={prediction.floor} style={styles.floorPage}>
              <Text style={styles.floorTitle}>
                Poschodie {prediction.floor}
              </Text>

              <View style={styles.occupancyBox}>
                <Text style={styles.occupancyBoxLabel}>
                  Predpokladaná obsadenosť
                </Text>
                <Text style={styles.occupancyBoxValue}>
                  {prediction.predictedOccupied} / 12
                </Text>
              </View>

              <Text style={styles.recommendedTitle}>
                Najmenej pravdepodobne obsadené miesta
              </Text>

              <View style={styles.spotsRow}>
                {prediction.recommendedSpots.map((spot) => (
                  <View key={spot.id} style={styles.spotCard}>
                    <Text style={styles.spotLabel}>
                      P{prediction.floor}-{spot.label}
                    </Text>
                    <Text style={styles.spotChance}>
                      {Math.round((1 - spot.probabilityOccupied) * 100)}% voľné
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    lineHeight: 21,
  },
  hoursRow: {
    paddingTop: 16,
    paddingBottom: 6,
    paddingRight: 10,
  },
  hourChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  hourChipActive: {
    backgroundColor: "#2563eb",
  },
  hourChipText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  hourChipTextActive: {
    color: "#ffffff",
  },
  floorPagerWrapper: {
    height: FLOOR_PAGE_HEIGHT,
    marginTop: 16,
  },
  floorPage: {
    height: FLOOR_PAGE_HEIGHT,
    backgroundColor: "#f9fafb",
    borderRadius: 18,
    padding: 16,
  },
  floorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  occupancyBox: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e7ff",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  occupancyBoxLabel: {
    fontSize: 12,
    color: "#4338ca",
    marginBottom: 4,
  },
  occupancyBoxValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#312e81",
  },
  recommendedTitle: {
    marginTop: 22,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  spotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },
  spotCard: {
    width: "48%",
    minHeight: 96,
    backgroundColor: "#ecfeff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  spotLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  spotChance: {
    fontSize: 11,
    color: "#0f766e",
    marginTop: 6,
    textAlign: "center",
  },
});