import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Band } from '../../components/ui/Band';
import { Blob } from '../../components/ui/Blob';
import { Mochi } from '../../components/ui/Mochi';
import { Card, Check, Chip, Eyebrow, Num, Pill, Title, Txt } from '../../components/ui/primitives';
import { blobShapeOf, CAT, categoryColor, M } from '../../design/tokens';
import { chainSuggestions } from '../../logic/recommend';
import { masterByName, useMorak } from '../../store/morak';

const shortName = (n: string) => n.replace(/\s*\(.*\)/, '');

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const shopping = useMorak((s) => s.shopping);
  const fridge = useMorak((s) => s.fridge);
  const toggleShopItem = useMorak((s) => s.toggleShopItem);
  const removeShopItem = useMorak((s) => s.removeShopItem);
  const addShopItems = useMorak((s) => s.addShopItems);
  const completeShopping = useMorak((s) => s.completeShopping);
  const [justMoved, setJustMoved] = React.useState(0);

  const chains = React.useMemo(
    () => chainSuggestions(fridge, shopping.map((i) => i.name)),
    [fridge, shopping],
  );
  const checkedCount = shopping.filter((i) => i.checked).length;

  return (
    <View style={{ flex: 1, backgroundColor: M.cream }}>
      <Band from={CAT.grain[0]} h={210 + insets.top} />

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
          <Eyebrow color="#B08A3C">SHOP LIST</Eyebrow>
          <View style={{ height: 8 }} />
          <Title size={25}>
            오늘 장 볼{'\n'}친구 <Num size={25}>{shopping.length}</Num>명
          </Title>
        </View>
        <View style={{ marginTop: 6 }}>
          <Mochi size={70} mood="cheer" tint={CAT.grain[0]} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginTop: 18 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingBottom: 12 }}
      >
        {/* 체크리스트 */}
        {shopping.length === 0 ? (
          <Card pad={22} style={{ alignItems: 'center', gap: 10 }}>
            <Mochi size={72} mood="happy" tint={CAT.grain[0]} />
            <Txt size={13} color={M.sub} style={{ textAlign: 'center', lineHeight: 19 }}>
              {justMoved > 0
                ? `모락에 새 친구 ${justMoved}명이 도착했어요.`
                : '장보기 리스트가 비어 있어요.\n메뉴에서 부족한 재료를 담아 보세요.'}
            </Txt>
          </Card>
        ) : (
          <Card pad={17}>
            <View style={{ gap: 14 }}>
              {shopping.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => toggleShopItem(item.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}
                >
                  <Check on={item.checked} square />
                  <View style={{ opacity: item.checked ? 0.4 : 1 }}>
                    <Blob
                      shape={blobShapeOf(item.name)}
                      c={
                        item.checked
                          ? [M.cap, M.cap]
                          : categoryColor(masterByName(item.name)?.category ?? '양념')
                      }
                      size={32}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      opacity: item.checked ? 0.42 : 1,
                    }}
                  >
                    <Txt
                      size={14}
                      weight="semibold"
                      style={item.checked ? { textDecorationLine: 'line-through' } : undefined}
                    >
                      {shortName(item.name)}
                    </Txt>
                    <Txt size={12} weight="semibold" color={M.sub}>
                      {item.quantity}
                    </Txt>
                  </View>
                  <Pressable onPress={() => removeShopItem(item.id)} hitSlop={8}>
                    <Txt size={14} color={M.cap}>
                      ✕
                    </Txt>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        {/* 연쇄 추천 */}
        {chains.length > 0 && (
          <View>
            <Eyebrow>＋ ONE MORE</Eyebrow>
            <Txt size={12.5} color={M.sub} style={{ marginTop: 3, marginBottom: 12 }}>
              한 가지 더 담으면 메뉴가 늘어나요
            </Txt>
            <View style={{ gap: 9 }}>
              {chains.map((c) => {
                const master = masterByName(c.addName);
                return (
                  <Card
                    key={c.menu.id}
                    pad={11}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  >
                    <Blob
                      shape={blobShapeOf(c.addName)}
                      c={categoryColor(master?.category ?? '양념')}
                      size={34}
                    />
                    <View style={{ flex: 1 }}>
                      <Txt size={13.5} weight="bold">
                        {shortName(c.addName)} {master ? `1${master.defaultUnit}` : ''}
                      </Txt>
                      <Txt size={12} color={M.sub} style={{ marginTop: 2 }}>
                        ＋ {c.menu.name}
                      </Txt>
                    </View>
                    <Chip kind="ok">+1 메뉴</Chip>
                    <Pressable
                      onPress={() => addShopItems([{ name: c.addName, linkedMenuId: c.menu.id }])}
                      hitSlop={6}
                      style={({ pressed }) => ({
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: M.mochaSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.6 : 1,
                      })}
                    >
                      <Txt size={17} weight="bold" color={M.mocha}>
                        ＋
                      </Txt>
                    </Pressable>
                  </Card>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
        <Pill
          disabled={checkedCount === 0}
          onPress={() => {
            const n = completeShopping();
            setJustMoved(n);
          }}
        >
          구매 완료 → 냉장고로{checkedCount > 0 ? ` · ${checkedCount}` : ''}
        </Pill>
      </View>
    </View>
  );
}
