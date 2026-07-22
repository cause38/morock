import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Band } from '../../components/ui/Band';
import { Blob } from '../../components/ui/Blob';
import { Mochi } from '../../components/ui/Mochi';
import { Card, Chip, Eyebrow, Num, Title, Txt } from '../../components/ui/primitives';
import { blobShapeOf, CAT, categoryColor, M, shadow } from '../../design/tokens';
import { ddayKind, ddayLabel, ddayOf } from '../../logic/dday';
import { recommendMenus } from '../../logic/recommend';
import { useMorak } from '../../store/morak';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fridge = useMorak((s) => s.fridge);

  const sorted = React.useMemo(
    () => [...fridge].sort((a, b) => ddayOf(a.expiryDate) - ddayOf(b.expiryDate)),
    [fridge],
  );
  const recos = React.useMemo(() => recommendMenus(fridge).slice(0, 6), [fridge]);
  const hasUrgent = sorted.length > 0 && ddayOf(sorted[0].expiryDate) <= 1;

  return (
    <View style={{ flex: 1, backgroundColor: M.cream }}>
      <Band from={CAT.veg[0]} h={236 + insets.top} />

      {/* 헤더 */}
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
          <Eyebrow color="#6E9A47">MY FRIDGE · {format(new Date(), 'M.d')}</Eyebrow>
          <View style={{ height: 8 }} />
          <Title size={26}>
            냉장고에 <Num size={26}>{fridge.length}</Num>명의{'\n'}친구가 있어요
          </Title>
        </View>
        <View style={{ marginTop: 6 }}>
          <Mochi size={74} mood={hasUrgent ? 'worried' : 'happy'} tint={CAT.veg[0]} />
        </View>
      </View>

      {/* 냉장고 — 임박 순 가로 스크롤 */}
      <View style={{ marginTop: 18 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingBottom: 10,
          }}
        >
          <Txt size={13.5} weight="bold" color={M.ink2}>
            임박한 친구부터
          </Txt>
          <Pressable onPress={() => router.navigate('/fridge')} hitSlop={8}>
            <Txt size={12} weight="semibold" color={M.sub}>
              전체 보기 ›
            </Txt>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 11, paddingHorizontal: 24, paddingVertical: 4 }}
        >
          {sorted.map((item) => {
            const dday = ddayOf(item.expiryDate);
            return (
              <Card
                key={item.id}
                pad={12}
                style={{ width: 88, alignItems: 'center', gap: 8 }}
              >
                <Blob shape={blobShapeOf(item.name)} c={categoryColor(item.category)} size={50} />
                <Txt size={12.5} weight="bold" numberOfLines={1}>
                  {item.name.replace(/\s*\(.*\)/, '')}
                </Txt>
                <Chip kind={ddayKind(dday)}>{ddayLabel(dday)}</Chip>
              </Card>
            );
          })}
        </ScrollView>
      </View>

      {/* 오늘의 추천 — 아래 시트 */}
      <View
        style={{
          flex: 1,
          marginTop: 22,
          backgroundColor: M.white,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 22,
          paddingHorizontal: 24,
          ...shadow.card,
        }}
      >
        <Eyebrow>TODAY'S RECOMMEND</Eyebrow>
        <View style={{ height: 6 }} />
        <Title size={20}>이 친구들로{'\n'}오늘 만들 수 있어요</Title>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 11, paddingTop: 14, paddingBottom: 16 }}
        >
          {recos.length === 0 && (
            <Card pad={18} style={{ alignItems: 'center', gap: 10 }}>
              <Mochi size={64} mood="worried" tint={CAT.sauce[0]} />
              <Txt size={13} color={M.sub}>
                냉장고가 비어 있어요. 첫 친구를 추가해 주세요.
              </Txt>
            </Card>
          )}
          {recos.map((r) => {
            const [b0, b1] = [r.owned[0], r.owned[1] ?? r.owned[0]];
            return (
              <Card
                key={r.menu.id}
                pad={13}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
                onPress={() => router.push(`/menu/${r.menu.id}`)}
              >
                <View style={{ width: 60, height: 58 }}>
                  <View style={{ position: 'absolute', left: 0, top: 2 }}>
                    <Blob
                      shape={blobShapeOf(b0?.name ?? r.menu.name)}
                      c={categoryColor(b0?.category ?? '양념')}
                      size={46}
                    />
                  </View>
                  <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                    <Blob
                      shape={blobShapeOf(b1?.name ?? r.menu.name + '2')}
                      c={categoryColor(b1?.category ?? '곡류')}
                      size={34}
                    />
                  </View>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt size={15} weight="bold">
                    {r.menu.name}
                  </Txt>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, alignItems: 'center' }}>
                    {r.urgent && r.urgent.dday <= 3 ? (
                      <Chip kind={ddayKind(r.urgent.dday)}>
                        {ddayLabel(r.urgent.dday)} {r.urgent.item.name.replace(/\s*\(.*\)/, '')} 활용
                      </Chip>
                    ) : (
                      <Chip>{r.menu.category}</Chip>
                    )}
                    <Txt size={11.5} color={M.sub}>
                      <Num size={11.5} color={M.sub}>
                        {r.menu.cookingTime}
                      </Num>
                      분
                    </Txt>
                  </View>
                </View>
                <Chip kind={r.missing.length === 0 ? 'ok' : 'mocha'} size="lg">
                  {r.missing.length === 0 ? '바로' : `−${r.missing.length}`}
                </Chip>
              </Card>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
