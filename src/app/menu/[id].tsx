import React from 'react';
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Blob } from '../../components/ui/Blob';
import { Mochi } from '../../components/ui/Mochi';
import {
  Card,
  Check,
  Chip,
  CircleButton,
  Eyebrow,
  Num,
  Pill,
  Title,
  Txt,
} from '../../components/ui/primitives';
import { blobShapeOf, CAT, categoryColor, categoryKey, DDAY, M } from '../../design/tokens';
import { MENUS } from '../../data/menus';
import { ddayKind, ddayLabel } from '../../logic/dday';
import { matchMenu, normalizeName } from '../../logic/recommend';
import { masterByName, useMorak } from '../../store/morak';
import { recordMade } from '../../api/sync';

const shortName = (n: string) => n.replace(/\s*\(.*\)/, '');

export default function MenuDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fridge = useMorak((s) => s.fridge);
  const addShopItems = useMorak((s) => s.addShopItems);
  const markMade = useMorak((s) => s.markMade);
  const [made, setMade] = React.useState(false);

  const menu = MENUS.find((m) => m.id === id);
  if (!menu) {
    return (
      <View style={{ flex: 1, backgroundColor: M.cream, alignItems: 'center', justifyContent: 'center' }}>
        <Txt color={M.sub}>메뉴를 찾을 수 없어요.</Txt>
      </View>
    );
  }

  const match = matchMenu(menu, fridge);
  const ownedByNorm = new Map(match.owned.map((f) => [normalizeName(f.name), f]));

  // 히어로 그라데이션은 대표 재료 2개의 카테고리 톤
  const heroA = match.owned[0] ? categoryColor(match.owned[0].category) : CAT.veg;
  const heroB = match.owned[1] ? categoryColor(match.owned[1].category) : CAT.grain;

  const onAddToShop = () => {
    addShopItems(match.missing.map((name) => ({ name, linkedMenuId: menu.id })));
    router.navigate('/shop');
  };

  return (
    <View style={{ flex: 1, backgroundColor: M.cream }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 24,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <CircleButton label="‹" onPress={() => router.back()} />
        <Eyebrow>MENU DETAIL</Eyebrow>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* 히어로 */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <LinearGradient
            colors={[heroA[0], heroB[0]]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{
              height: 148,
              borderRadius: 22,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ position: 'absolute', left: 60, top: 28 }}>
              <Blob shape={blobShapeOf(menu.name)} c={heroA} size={76} />
            </View>
            <View style={{ position: 'absolute', right: 56, bottom: 22 }}>
              <Blob shape={blobShapeOf(menu.name + '2')} c={heroB} size={58} />
            </View>
            {match.urgent && match.urgent.dday <= 3 && (
              <View style={{ position: 'absolute', top: 14, right: 14 }}>
                <Chip kind={ddayKind(match.urgent.dday)} size="lg">
                  {ddayLabel(match.urgent.dday)} {shortName(match.urgent.item.name)} 활용
                </Chip>
              </View>
            )}
          </LinearGradient>

          <View style={{ marginTop: 16 }}>
            <Title size={25}>{menu.name}</Title>
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 8, alignItems: 'center' }}>
              <Txt size={12.5} weight="semibold" color={M.sub}>
                <Num size={12.5} color={M.sub}>
                  {menu.cookingTime}
                </Num>
                분
              </Txt>
              <Txt size={12.5} color={M.cap}>
                ·
              </Txt>
              <Txt size={12.5} weight="semibold" color={M.sub}>
                {menu.category}
              </Txt>
              <Txt size={12.5} color={M.cap}>
                ·
              </Txt>
              <Txt size={12.5} weight="semibold" color={DDAY.d4.fg}>
                <Num size={12.5} color={DDAY.d4.fg}>
                  {match.owned.length}
                </Num>
                <Txt size={12.5} color={M.sub}>
                  /<Num size={12.5} color={M.sub}>{menu.required.length}</Num> 보유
                </Txt>
              </Txt>
            </View>
            <Txt size={13} color={M.sub} style={{ marginTop: 8, lineHeight: 19 }}>
              {menu.description}
            </Txt>
          </View>
        </View>

        {/* 통합 재료 체크리스트 */}
        <View style={{ paddingHorizontal: 20 }}>
          <Card pad={18}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <Eyebrow>INGREDIENTS · {menu.required.length}</Eyebrow>
              {match.missing.length > 0 && (
                <Txt size={11.5} weight="bold" color={DDAY.d1.fg}>
                  {match.missing.length}개 부족
                </Txt>
              )}
            </View>
            <View style={{ gap: 13 }}>
              {menu.required.map((name) => {
                const owned = ownedByNorm.get(normalizeName(name));
                const have = Boolean(owned);
                const master = masterByName(name);
                const cat = owned?.category ?? master?.category ?? '양념';
                const urgentKind =
                  owned && match.urgent && owned.id === match.urgent.item.id && match.urgent.dday <= 3
                    ? ddayKind(match.urgent.dday)
                    : null;
                return (
                  <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
                    <View style={{ opacity: have ? 1 : 0.32 }}>
                      <Blob
                        shape={blobShapeOf(name)}
                        c={have ? categoryColor(cat) : [M.cap, M.cap]}
                        size={34}
                      />
                    </View>
                    <View style={{ flex: 1, opacity: have ? 1 : 0.6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                        <Txt size={14} weight="semibold">
                          {shortName(name)}
                        </Txt>
                        {urgentKind && (
                          <Chip kind={urgentKind}>{ddayLabel(match.urgent!.dday)}</Chip>
                        )}
                      </View>
                      <Txt size={11.5} color={M.sub} style={{ marginTop: 2 }}>
                        {have ? owned!.quantity : master?.defaultUnit ?? '약간'}
                      </Txt>
                    </View>
                    <Check on={have} />
                  </View>
                );
              })}
            </View>
            {menu.optional.length > 0 && (
              <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: M.line }}>
                <Txt size={11.5} weight="semibold" color={M.cap}>
                  있으면 더 좋아요 · {menu.optional.map(shortName).join(' · ')}
                </Txt>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>

      {/* 푸터 액션 */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 24) }}>
        {match.missing.length > 0 ? (
          <>
            <Txt size={12.5} color={M.sub} style={{ textAlign: 'center', marginBottom: 11 }}>
              <Txt size={12.5} weight="bold">
                {match.missing.map(shortName).join(' · ')}
              </Txt>
              {'만 사면 만들 수 있어요'}
            </Txt>
            <Pill onPress={onAddToShop}>장보기에 {match.missing.length}개 담기 →</Pill>
          </>
        ) : made ? (
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Mochi size={64} mood="cheer" tint={CAT[categoryKey('채소')][0]} />
            <Txt size={13} color={M.sub}>
              오늘의 모락 완성. 맛있게 드세요.
            </Txt>
          </View>
        ) : (
          <>
            <Txt size={12.5} color={M.sub} style={{ textAlign: 'center', marginBottom: 11 }}>
              지금 바로 만들 수 있어요
            </Txt>
            <Pill
              onPress={() => {
                markMade(menu.id);
                recordMade(menu.id);
                setMade(true);
              }}
            >
              오늘 이 메뉴 만들었어요
            </Pill>
          </>
        )}
      </View>
    </View>
  );
}
