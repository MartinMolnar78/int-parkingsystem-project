import React, { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import OccupancyByHourSlide from "./OccupancyByHourSlide";
import PredictionByHourSlide from "./PredictionByHourSlide";

function PlaceholderSlide({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.placeholderCard}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>{description}</Text>
    </View>
  );
}

export default function StatsCarousel() {
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const slideWidth = width - 40;
  const interval = slideWidth + 12;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / interval);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={interval}
        snapToAlignment="start"
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.slide, { width: slideWidth }]}>
          <OccupancyByHourSlide />
        </View>

        <View style={[styles.slide, { width: slideWidth }]}>
          <PredictionByHourSlide />
        </View>
      </ScrollView>

      <View style={styles.dotsRow}>
        {[0, 1].map((index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  scrollContent: {
    paddingRight: 12,
  },
  slide: {
    marginRight: 12,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: "#2563eb",
  },
  placeholderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    minHeight: 240,
    justifyContent: "center",
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
});
