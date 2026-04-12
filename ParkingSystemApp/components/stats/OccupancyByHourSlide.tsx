import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
    HOURS,
    getAverageCarsForHour,
    getAverageOccupancyPercentForHour,
    historicalOccupancyByHour,
} from "../../data/historicalStats";
import { HourValue } from "../../types/stats";
import WeeklyBarChart from "./WeeklyBarChart";
export default function OccupancyByHourSlide() {
  const [selectedHour, setSelectedHour] = useState<HourValue>(8);

  const chartData = historicalOccupancyByHour[selectedHour];

  const averageCars = useMemo(
    () => getAverageCarsForHour(selectedHour),
    [selectedHour],
  );

  const averagePercent = useMemo(
    () => getAverageOccupancyPercentForHour(selectedHour),
    [selectedHour],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Vyťaženosť parkoviska</Text>
      <Text style={styles.subtitle}>
        Priemerný počet áut podľa dní v týždni pre zvolený čas.
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

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Zvolený čas</Text>
          <Text style={styles.summaryValue}>{selectedHour}:00</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Priemer áut</Text>
          <Text style={styles.summaryValue}>{averageCars}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Obsadenosť</Text>
          <Text style={styles.summaryValue}>{averagePercent}%</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>
        Odhadovaný počet áut o {selectedHour}:00
      </Text>

      <WeeklyBarChart data={chartData} />
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 18,
  },
});
