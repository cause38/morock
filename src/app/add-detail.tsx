import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Blob } from '../components/ui/Blob';
import { Card, Chip, CircleButton, Eyebrow, Num, Pill, Title, Txt } from '../components/ui/primitives';
import { blobShapeOf, categoryColor, DDAY, font, M } from '../design/tokens';
import { ddayKind, ddayLabel, ddayOf } from '../logic/dday';
import { useAddDraft } from '../store/addDraft';
import { useMorak } from '../store/morak';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function AddDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selected, update, remove } = useAddDraft();
  const addFridgeItem = useMorak((s) => s.addFridgeItem);

  const draft = selected.find((d) => d.name === name);
  const [month, setMonth] = React.useState(() =>
    startOfMonth(draft ? parseISO(draft.expiryDate) : new Date()),
  );

  if (!draft) {
    return (
      <View style={{ flex: 1, backgroundColor: M.cream, alignItems: 'center', justifyContent: 'center' }}>
        <Txt color={M.sub}>선택한 재료가 없어요.</Txt>
      </View>
    );
  }

  const today = startOfDay(new Date());
  const expiry = parseISO(draft.expiryDate);
  const dday = ddayOf(draft.expiryDate);
  const kind = ddayKind(dday);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  const save = () => {
    addFridgeItem({
      name: draft.name,
      category: draft.category,
      quantity: draft.quantity,
      expiryDate: draft.expiryDate,
    });
    remove(draft.name);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: M.cream }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 24,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <CircleButton label="‹" onPress={() => router.back()} />
        <Eyebrow>NEW INGREDIENT</Eyebrow>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <Title size={23}>새 친구를{'\n'}맞이해요</Title>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
      >
        <Card pad={20}>
          {/* 이름 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Blob shape={blobShapeOf(draft.name)} c={categoryColor(draft.category)} size={60} />
            <View style={{ flex: 1 }}>
              <Eyebrow>NAME</Eyebrow>
              <Txt
                size={21}
                weight="bold"
                style={{ marginTop: 7, paddingBottom: 7, borderBottomWidth: 1.5, borderBottomColor: M.ink }}
              >
                {draft.name}
              </Txt>
            </View>
          </View>

          {/* 수량 · 카테고리 */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Eyebrow>QUANTITY</Eyebrow>
              <TextInput
                value={draft.quantity}
                onChangeText={(v) => update(draft.name, { quantity: v })}
                style={{
                  fontSize: 17,
                  fontFamily: font.bold,
                  color: M.ink,
                  marginTop: 7,
                  paddingBottom: 7,
                  paddingTop: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: M.line2,
                  borderStyle: 'dashed',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>CATEGORY</Eyebrow>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 7,
                  paddingBottom: 7,
                  borderBottomWidth: 1,
                  borderBottomColor: M.line2,
                  borderStyle: 'dashed',
                }}
              >
                <LinearGradient
                  colors={[...categoryColor(draft.category)]}
                  style={{ width: 12, height: 12, borderRadius: 4 }}
                />
                <Txt size={15} weight="bold">
                  {draft.category}
                </Txt>
              </View>
            </View>
          </View>

          {/* 유통기한 캘린더 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Eyebrow>EXPIRY</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Pressable onPress={() => setMonth((m) => addMonths(m, -1))} hitSlop={8}>
                <Txt size={15} color={M.sub}>
                  ‹
                </Txt>
              </Pressable>
              <Num size={12.5} color={M.ink2} weight={700}>
                {format(month, 'yyyy.M')}
              </Num>
              <Pressable onPress={() => setMonth((m) => addMonths(m, 1))} hitSlop={8}>
                <Txt size={15} color={M.sub}>
                  ›
                </Txt>
              </Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 11 }}>
            {WEEK_DAYS.map((d) => (
              <Txt
                key={d}
                size={10.5}
                weight="bold"
                color={M.cap}
                style={{ flex: 1, textAlign: 'center', paddingBottom: 4 }}
              >
                {d}
              </Txt>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {days.map((d) => {
              const active = isSameDay(d, expiry);
              const inMonth = isSameMonth(d, month);
              const disabled = isBefore(d, today);
              return (
                <Pressable
                  key={d.toISOString()}
                  disabled={disabled}
                  onPress={() => update(draft.name, { expiryDate: format(d, 'yyyy-MM-dd') })}
                  style={{
                    width: `${100 / 7}%`,
                    paddingVertical: 8,
                    borderRadius: 9,
                    backgroundColor: active ? M.mocha : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Num
                    size={12.5}
                    weight={active ? 800 : 600}
                    color={active ? '#fff' : disabled ? M.line2 : inMonth ? M.ink : M.cap}
                  >
                    {format(d, 'd')}
                  </Num>
                </Pressable>
              );
            })}
          </View>

          {/* D-day 안내 */}
          <View
            style={{
              marginTop: 14,
              paddingVertical: 11,
              paddingHorizontal: 14,
              backgroundColor: DDAY[kind].bg,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Txt size={13} weight="bold" color={DDAY[kind].fg}>
              {format(expiry, 'M/d')} · {ddayLabel(dday)}
              {kind === 'd1' ? ' 임박' : kind === 'd2' ? ' 주의' : ' 여유'}
            </Txt>
            <View style={{ flex: 1 }} />
            <Txt size={11.5} color={DDAY[kind].fg} style={{ opacity: 0.8 }}>
              {kind === 'd1' ? '가장 먼저 추천돼요' : '추천 순서에 반영돼요'}
            </Txt>
          </View>
        </Card>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 24) }}>
        <Pill onPress={save}>냉장고에 넣기</Pill>
      </View>
    </View>
  );
}
