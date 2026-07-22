import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import Svg, { Circle, Path } from 'react-native-svg';
import { Blob } from '../components/ui/Blob';
import {
  Card,
  Chip,
  CircleButton,
  Eyebrow,
  Num,
  Pill,
  Title,
  Txt,
} from '../components/ui/primitives';
import { blobShapeOf, categoryColor, font, M, shadow } from '../design/tokens';
import { INGREDIENT_MASTER } from '../data/ingredients';
import { normalizeName } from '../logic/recommend';
import { useAddDraft } from '../store/addDraft';
import { useMorak } from '../store/morak';

const OFTEN_USED = ['김치', '대파', '다진마늘', '진간장', '참기름', '고추장', '된장', '소금'];

export default function AddSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = React.useState('');
  const { selected, toggle, clear } = useAddDraft();
  const addFridgeItem = useMorak((s) => s.addFridgeItem);
  const recentNames = useMorak((s) => s.recentNames);
  const fridge = useMorak((s) => s.fridge);

  const inFridge = React.useMemo(
    () => new Set(fridge.map((f) => normalizeName(f.name))),
    [fridge],
  );
  const isSelected = (name: string) =>
    selected.some((d) => normalizeName(d.name) === normalizeName(name));

  const results = React.useMemo(() => {
    const q = normalizeName(query);
    if (!q) return [];
    return INGREDIENT_MASTER.filter((m) => normalizeName(m.name).includes(q)).slice(0, 8);
  }, [query]);

  const saveAll = () => {
    for (const d of selected) {
      addFridgeItem({
        name: d.name,
        category: d.category,
        quantity: d.quantity,
        expiryDate: d.expiryDate,
      });
    }
    clear();
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
        <CircleButton
          label="×"
          onPress={() => {
            clear();
            router.back();
          }}
        />
        <Eyebrow>ADD INGREDIENT</Eyebrow>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: 14 }}>
        <Title size={23}>어떤 친구를{'\n'}추가할까요</Title>
      </View>

      {/* 검색 필드 */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 18,
            backgroundColor: M.white,
            borderWidth: 1.5,
            borderColor: M.mochaSoft,
            ...shadow.card,
          }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={7} stroke={M.mocha} strokeWidth={2.2} />
            <Path d="m20 20-3.5-3.5" stroke={M.mocha} strokeWidth={2.2} strokeLinecap="round" />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="시금치, 두부, 양파 …"
            placeholderTextColor={M.cap}
            autoFocus
            style={{
              flex: 1,
              fontSize: 14.5,
              fontFamily: font.medium,
              color: M.ink,
              padding: 0,
            }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, gap: 20 }}
      >
        {/* 검색 결과 */}
        {results.length > 0 && (
          <View>
            <Eyebrow color={M.mocha}>SEARCH RESULT</Eyebrow>
            <View style={{ gap: 8, marginTop: 11 }}>
              {results.map((m) => {
                const sel = isSelected(m.name);
                const owned = inFridge.has(normalizeName(m.name));
                return (
                  <Card
                    key={m.id}
                    pad={11}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                    onPress={() => {
                      toggle(m.name);
                      setQuery('');
                    }}
                  >
                    <Blob shape={blobShapeOf(m.name)} c={categoryColor(m.category)} size={30} />
                    <View style={{ flex: 1 }}>
                      <Txt size={13.5} weight="bold">
                        {m.name}
                      </Txt>
                      <Txt size={11} color={M.sub} style={{ marginTop: 1 }}>
                        {m.category} · 보통 {m.shelfLifeDays}일 · {m.storage}
                        {owned ? ' · 이미 있어요' : ''}
                      </Txt>
                    </View>
                    <Chip kind={sel ? 'mocha' : 'outline'}>{sel ? '담김' : '＋ 담기'}</Chip>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {/* 최근 */}
        {recentNames.length > 0 && (
          <View>
            <Eyebrow>RECENT</Eyebrow>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 11 }}>
              {recentNames.map((n) => (
                <Chip key={n} kind={isSelected(n) ? 'mocha' : 'outline'} size="lg" onPress={() => toggle(n)}>
                  ＋ {n}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* 자주 쓰는 재료 */}
        <View>
          <Eyebrow>OFTEN USED</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 11 }}>
            {OFTEN_USED.map((n) => (
              <Chip key={n} kind={isSelected(n) ? 'mocha' : 'neutral'} size="lg" onPress={() => toggle(n)}>
                {n}
              </Chip>
            ))}
          </View>
        </View>

        {/* 담은 재료 */}
        {selected.length > 0 && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Eyebrow color={M.mocha}>SELECTED · {selected.length}</Eyebrow>
              <Txt size={11.5} weight="semibold" color={M.sub}>
                탭하면 상세 입력 ›
              </Txt>
            </View>
            <View style={{ gap: 8, marginTop: 11 }}>
              {selected.map((d) => (
                <Card
                  key={d.name}
                  pad={11}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  onPress={() =>
                    router.push({ pathname: '/add-detail', params: { name: d.name } })
                  }
                >
                  <Blob shape={blobShapeOf(d.name)} c={categoryColor(d.category)} size={30} />
                  <Txt size={13.5} weight="bold">
                    {d.name}
                  </Txt>
                  <View style={{ flex: 1 }} />
                  <Txt size={12} weight="semibold" color={M.sub}>
                    {d.quantity}
                  </Txt>
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderLeftColor: M.line,
                      paddingLeft: 10,
                    }}
                  >
                    <Num size={12} color={M.sub} weight={600}>
                      {format(parseISO(d.expiryDate), 'M/d')}
                    </Num>
                  </View>
                  <Txt size={15} color={M.cap}>
                    ›
                  </Txt>
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 24) }}>
        <Pill onPress={saveAll} disabled={selected.length === 0}>
          저장하기 · {selected.length}
        </Pill>
      </View>
    </View>
  );
}
