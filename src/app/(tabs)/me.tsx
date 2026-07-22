import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Band } from '../../components/ui/Band';
import { Mochi } from '../../components/ui/Mochi';
import { Card, Eyebrow, Num, Pill, Title, Txt } from '../../components/ui/primitives';
import { CAT, DDAY, M } from '../../design/tokens';
import { ddayOf } from '../../logic/dday';
import { useMorak } from '../../store/morak';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const fridge = useMorak((s) => s.fridge);
  const shopping = useMorak((s) => s.shopping);
  const madeMenuIds = useMorak((s) => s.madeMenuIds);
  const resetDemo = useMorak((s) => s.resetDemo);

  const urgentCount = fridge.filter((f) => ddayOf(f.expiryDate) <= 3).length;

  const stats: Array<[string, number, string]> = [
    ['냉장고 친구', fridge.length, '명'],
    ['임박한 친구', urgentCount, '명'],
    ['만든 메뉴', madeMenuIds.length, '개'],
    ['장보기', shopping.length, '개'],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: M.cream }}>
      <Band from={CAT.rose[0]} h={230 + insets.top} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
      >
        <View style={{ paddingHorizontal: 24, alignItems: 'center' }}>
          <Mochi size={92} mood="happy" tint={CAT.rose[0]} />
          <View style={{ height: 12 }} />
          <Eyebrow color="#C97F7F">MORAK</Eyebrow>
          <View style={{ height: 8 }} />
          <Title size={24} style={{ textAlign: 'center' }}>
            모아 담아, 모락
          </Title>
          <Txt size={13} color={M.sub} style={{ marginTop: 6 }}>
            오늘도 모락모락.
          </Txt>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            paddingHorizontal: 20,
            marginTop: 24,
          }}
        >
          {stats.map(([label, value, unit]) => (
            <Card key={label} pad={16} style={{ width: '48%', flexGrow: 1, gap: 6 }}>
              <Txt size={12} weight="semibold" color={M.sub}>
                {label}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                <Num size={24} color={label === '임박한 친구' && value > 0 ? DDAY.d1.fg : M.ink}>
                  {value}
                </Num>
                <Txt size={12} color={M.cap}>
                  {unit}
                </Txt>
              </View>
            </Card>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 10 }}>
          <Card pad={16}>
            <Eyebrow>ABOUT</Eyebrow>
            <Txt size={13} color={M.ink2} style={{ marginTop: 8, lineHeight: 20 }}>
              냉장고 속 재료의 유통기한을 기준으로 오늘의 도시락 메뉴를 추천해요. 유통기한 임박한
              친구부터 도시락에 모아 담아요.
            </Txt>
          </Card>
          <Pill kind="ghost" onPress={resetDemo}>
            데모 데이터 초기화
          </Pill>
          <Txt size={11} color={M.cap} style={{ textAlign: 'center', marginTop: 4 }}>
            Morak MVP · v0.1 · 로컬 저장
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}
