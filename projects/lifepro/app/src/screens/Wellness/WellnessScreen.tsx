import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout, shadows } from '../../theme';
import { getToday, generateId } from '../../utils/date';
import {
  getMoodForDate,
  upsertMood,
  getSleepForDate,
  upsertSleep,
  getWaterForDate,
  upsertWater,
} from '../../database';

const MOOD_FACES = [
  { score: 1, emoji: '😫', label: 'Terrible' },
  { score: 2, emoji: '😕', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
];

const MOOD_TAGS = ['Stressed', 'Energetic', 'Calm', 'Anxious', 'Happy', 'Tired', 'Focused', 'Grateful'];

export function WellnessScreen() {
  const today = getToday();

  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [waterGlasses, setWaterGlasses] = useState<number>(0);

  useEffect(() => {
    loadTodayData();
  }, []);

  async function loadTodayData() {
    const [mood, sleep, water] = await Promise.all([
      getMoodForDate(today),
      getSleepForDate(today),
      getWaterForDate(today),
    ]);

    if (mood) {
      setMoodScore(mood.score);
      setMoodTags(mood.tags ? JSON.parse(mood.tags) : []);
    }
    if (sleep) {
      setSleepHours(sleep.hours);
      setSleepQuality(sleep.quality);
    }
    if (water) {
      setWaterGlasses(water.glasses);
    }
  }

  async function handleMoodSelect(score: number) {
    setMoodScore(score);
    await upsertMood(generateId(), today, score, moodTags);
  }

  async function handleTagToggle(tag: string) {
    const newTags = moodTags.includes(tag)
      ? moodTags.filter(t => t !== tag)
      : [...moodTags, tag];
    setMoodTags(newTags);
    if (moodScore) {
      await upsertMood(generateId(), today, moodScore, newTags);
    }
  }

  async function handleSleepChange(hours: number, quality: number) {
    setSleepHours(hours);
    setSleepQuality(quality);
    await upsertSleep(generateId(), today, hours, quality);
  }

  async function handleWaterToggle(glass: number) {
    const newCount = glass <= waterGlasses ? glass - 1 : glass;
    setWaterGlasses(newCount);
    await upsertWater(generateId(), today, newCount);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Mood Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {MOOD_FACES.map(face => (
            <Pressable
              key={face.score}
              style={[
                styles.moodOption,
                moodScore === face.score && styles.moodSelected,
              ]}
              onPress={() => handleMoodSelect(face.score)}
            >
              <Text style={styles.moodEmoji}>{face.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  moodScore === face.score && styles.moodLabelSelected,
                ]}
              >
                {face.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Mood Tags */}
        {moodScore && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>What's on your mind?</Text>
            <View style={styles.tagsRow}>
              {MOOD_TAGS.map(tag => (
                <Pressable
                  key={tag}
                  style={[
                    styles.tag,
                    moodTags.includes(tag) && styles.tagSelected,
                  ]}
                  onPress={() => handleTagToggle(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      moodTags.includes(tag) && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* Sleep Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Last night's sleep</Text>
        <View style={styles.sleepRow}>
          <View style={styles.sleepControl}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => {
                const h = Math.max(0, sleepHours - 0.5);
                handleSleepChange(h, sleepQuality);
              }}
            >
              <Text style={styles.stepperText}>-</Text>
            </Pressable>
            <View style={styles.sleepValueContainer}>
              <Text style={styles.sleepValue}>{sleepHours}</Text>
              <Text style={styles.sleepUnit}>hours</Text>
            </View>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => {
                const h = Math.min(24, sleepHours + 0.5);
                handleSleepChange(h, sleepQuality);
              }}
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Sleep Quality */}
        <Text style={styles.qualityLabel}>Quality</Text>
        <View style={styles.qualityRow}>
          {[1, 2, 3, 4, 5].map(q => (
            <Pressable
              key={q}
              onPress={() => handleSleepChange(sleepHours, q)}
            >
              <MaterialCommunityIcons
                name={q <= sleepQuality ? 'star' : 'star-outline'}
                size={32}
                color={q <= sleepQuality ? colors.secondary[400] : colors.neutral[300]}
              />
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Water Card */}
      <Card style={styles.card}>
        <View style={styles.waterHeader}>
          <Text style={styles.cardTitle}>Water intake</Text>
          <Text style={styles.waterCount}>{waterGlasses}/8 glasses</Text>
        </View>
        <View style={styles.waterRow}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Pressable
              key={i}
              style={[
                styles.waterGlass,
                i < waterGlasses && styles.waterGlassFilled,
              ]}
              onPress={() => handleWaterToggle(i + 1)}
            >
              <MaterialCommunityIcons
                name={i < waterGlasses ? 'cup' : 'cup-outline'}
                size={28}
                color={i < waterGlasses ? colors.info : colors.neutral[300]}
              />
            </Pressable>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.surfaceSecondary,
  },
  content: {
    padding: layout.screenPaddingH,
    paddingBottom: 40,
  },
  card: {
    marginBottom: spacing.xl,
  },
  cardTitle: {
    ...typography.h3,
    color: lightTheme.textPrimary,
    marginBottom: spacing.base,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    ...typography.small,
    color: lightTheme.textSecondary,
    marginTop: spacing.xs,
  },
  moodLabelSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  tagsContainer: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  tagsLabel: {
    ...typography.caption,
    color: lightTheme.textSecondary,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  tagSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  tagText: {
    ...typography.caption,
    color: lightTheme.textSecondary,
  },
  tagTextSelected: {
    color: colors.primary[600],
    fontWeight: '500',
  },
  sleepRow: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sleepControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 24,
    fontWeight: '600',
    color: lightTheme.textPrimary,
  },
  sleepValueContainer: {
    alignItems: 'center',
  },
  sleepValue: {
    fontSize: 36,
    fontWeight: '700',
    color: lightTheme.textPrimary,
  },
  sleepUnit: {
    ...typography.caption,
    color: lightTheme.textSecondary,
  },
  qualityLabel: {
    ...typography.label,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  waterCount: {
    ...typography.label,
    color: lightTheme.textSecondary,
  },
  waterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterGlass: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterGlassFilled: {
    backgroundColor: colors.info + '15',
  },
});
