import { ThemedView } from '@/components/ThemedView';
import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export default function ReanimatedFlashListScreen() {
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const response = await fetch(
          'https://randomuser.me/api/?results=1000&nat=us',
        );
        const data = await response.json();
        const fetchedNames = data.results.map(
          (user: any) => `${user.name.first} ${user.name.last}`,
        );
        setNames(fetchedNames);
      } catch (error) {
        console.error('Error fetching names:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNames();
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [-100, 0, 100],
            [3, 1, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const renderParallaxHeader = () => (
    <Animated.View style={[styles.parallaxHeader, headerAnimatedStyle]}>
      <Text style={styles.parallaxHeaderText}>Parallax Header</Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Animate onScroll' }} />
      <ThemedView style={styles.container}>
        <AnimatedFlashList
          data={names}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{item as string}</Text>
            </View>
          )}
          estimatedItemSize={50}
          ListHeaderComponent={renderParallaxHeader}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  parallaxHeader: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parallaxHeaderText: {
    color: 'red',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
