import React from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { Band } from '../../components/ui/Band';
import { Blob } from '../../components/ui/Blob';
import { Mochi } from '../../components/ui/Mochi';
import { Card, Chip, Eyebrow, Num, Pill, Title, Txt } from '../../components/ui/primitives';
import { blobShapeOf, CAT, categoryColor, M } from '../../design/tokens';
import { ddayKind, ddayLabel, ddayOf } from '../../logic/dday';
import { useMorak } from '../../store/morak';

export default function FridgeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fridge = useMorak((s) => s.fridge);
  const removeFridgeItem = useMorak((s) => s.removeFridgeItem);

  const sorted = React.useMemo(
    () => [...fridge].sort((a, b) => ddayOf(a.expiryDate) - ddayOf(b.expiryDate)),
    [fridge],
  );

  const confirmRemove = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`${name} 친구를 보냈나요? 냉장고에서 빼요.`)) removeFridgeItem(id);
      return;
    }
    Alert.alert('재료 빼기', `${name} 친구를 냉장고에서 뺄까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '빼기', style: 'destructive', onPress: () => removeFridgeItem(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: M.cream }}>
      <Band from={CAT.sauce[0]} h={210 + insets.top} />
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Eyebrow color="#5F87A3">FRIDGE</Eyebrow>
          <View style={{ height: 8 }} />
          <Title size={25}>
            어떤 친구들이{'\n'}있는지 볼까요
          </Title>
        </View>
        <View style={{ marginTop: 6 }}>
          <Mochi size={70} mood="happy" tint={CAT.sauce[0]} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 9, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 }}
        style={{ flex: 1 }}
      >
        {sorted.length === 0 && (
          <Card pad={22} style={{ alignItems: 'center', gap: 10 }}>
            <Mochi size={72} mood="worried" tint={CAT.sauce[0]} />
            <Txt size={13} color={M.sub}>
              냉장고가 비어 있어요. 첫 친구를 추가해 주세요.
            </Txt>
          </Card>
        )}
        {sorted.map((item) => {
          const dday = ddayOf(item.expiryDate);
          return (
            <Card
              key={item.id}
              pad={13}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}
            >
              <Blob shape={blobShapeOf(item.name)} c={categoryColor(item.category)} size={40} />
              <View style={{ flex: 1 }}>
                <Txt size={14} weight="bold">
                  {item.name}
                </Txt>
                <Txt size={11.5} color={M.sub} style={{ marginTop: 2 }}>
                  {item.quantity} · {format(parseISO(item.expiryDate), 'M월 d일')}까지
                </Txt>
              </View>
              <Chip kind={ddayKind(dday)}>{ddayLabel(dday)}</Chip>
              <Pressable onPress={() => confirmRemove(item.id, item.name)} hitSlop={8}>
                <Txt size={15} color={M.cap}>
                  ✕
                </Txt>
              </Pressable>
            </Card>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Pill onPress={() => router.push('/add')}>＋ 새 친구 추가</Pill>
      </View>
    </View>
  );
}
