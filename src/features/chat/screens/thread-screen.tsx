import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { queryKeys } from '@/core/api/query-keys';
import { errorMessage } from '@/core/i18n';
import { useRealtimeStatus } from '@/core/realtime';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Text } from '@/shared/ui/text';
import { unmatch, type Message } from '../api';
import { chatKeys, type ConversationsData } from '../cache';
import type { PendingMessage } from '../chat-store';
import { dayLabel, sameDay } from '../time';
import { useThread } from '../use-thread';

const MAX_LENGTH = 2000;

type Row =
  | { kind: 'message'; key: string; message: Message; mine: boolean }
  | { kind: 'pending'; key: string; pending: PendingMessage }
  | { kind: 'day'; key: string; label: string }
  | { kind: 'matched'; key: string };

/** Newest first (inverted list), with a day heading above the first message of each day. */
function buildRows(
  pending: PendingMessage[],
  messages: Message[],
  myId: string | undefined,
  showMatched: boolean,
): Row[] {
  const rows: Row[] = pending.map((p) => ({ kind: 'pending', key: `p-${p.clientMsgId}`, pending: p }));
  messages.forEach((m, i) => {
    rows.push({ kind: 'message', key: m.id, message: m, mine: m.senderId === myId });
    const older = messages[i + 1];
    if (!older || !sameDay(older.createdAt, m.createdAt)) {
      rows.push({ kind: 'day', key: `d-${m.id}`, label: dayLabel(m.createdAt) });
    }
  });
  if (showMatched) rows.push({ kind: 'matched', key: 'matched' });
  return rows;
}

export function ThreadScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    conversationId: string;
    name?: string;
    photoUrl?: string;
    memberId?: string;
  }>();
  const conversationId = params.conversationId;
  const cached = queryClient
    .getQueryData<ConversationsData>(chatKeys.conversations)
    ?.pages.flatMap((p) => p.items)
    .find((c) => c.id === conversationId);
  const name = params.name ?? cached?.member.displayName ?? '';
  const photoUrl = params.photoUrl ?? cached?.member.photoUrl;
  const memberId = params.memberId ?? cached?.member.userId;

  const thread = useThread(conversationId);
  const online = useRealtimeStatus((s) => s.status !== 'offline');
  const [text, setText] = useState('');
  const [menu, setMenu] = useState(false);
  const [confirmUnmatch, setConfirmUnmatch] = useState(false);

  const rows = buildRows(thread.pending, thread.messages, thread.myId, !thread.loading);

  const submit = () => {
    if (!text.trim()) return;
    thread.send(text);
    setText('');
  };

  const doUnmatch = async () => {
    setConfirmUnmatch(false);
    await unmatch(conversationId).catch(() => undefined);
    void queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
    void queryClient.invalidateQueries({ queryKey: queryKeys.matches });
    router.back();
  };

  const renderRow = ({ item }: { item: Row }) => {
    switch (item.kind) {
      case 'day':
        return (
          <Text variant="small" color="muted" style={styles.day}>
            {item.label}
          </Text>
        );
      case 'matched':
        return (
          <View style={styles.system}>
            <Text variant="label" style={styles.center}>
              {t('thread.matched', { name })}
            </Text>
            <Text variant="caption" color="text2" style={styles.center}>
              {t('thread.matchedHint')}
            </Text>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.outWrap}>
            <View style={[styles.bubble, styles.out, styles.pendingBubble]}>
              <Text variant="body" style={styles.outText}>
                {item.pending.body}
              </Text>
            </View>
            {item.pending.status === 'failed' ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => thread.retry(item.pending.clientMsgId)}
                style={styles.status}
                hitSlop={8}
              >
                <Feather name="alert-circle" size={12} color={colors.danger} />
                <Text variant="small" color="danger">
                  {t('thread.notSent')}
                </Text>
              </Pressable>
            ) : (
              <Text variant="small" color="muted" style={styles.status}>
                {t('thread.sending')}
              </Text>
            )}
          </View>
        );
      case 'message':
        return item.mine ? (
          <View style={styles.outWrap}>
            <View style={[styles.bubble, styles.out]}>
              <Text variant="body" style={styles.outText}>
                {item.message.body}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.bubble, styles.in]}>
            <Text variant="body">{item.message.body}</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => router.back()} style={styles.icon}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('thread.viewProfile', { name })}
          onPress={() => memberId && router.push(`/member/${memberId}` as Href)}
          style={styles.who}
        >
          {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.avatar} contentFit="cover" /> : null}
          <View style={styles.flex}>
            <Text variant="label" numberOfLines={1}>
              {name}
            </Text>
            <Text variant="small" color={thread.isTyping ? 'accentInk' : 'text3'}>
              {thread.isTyping ? t('thread.typing') : t('thread.matchedShort')}
            </Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('thread.options')}
          onPress={() => setMenu(true)}
          style={styles.icon}
        >
          <Feather name="more-vertical" size={22} color={colors.ink} />
        </Pressable>
      </View>

      {!online ? (
        <View style={styles.offline} accessibilityLiveRegion="polite">
          <Feather name="wifi-off" size={16} color={colors.white} />
          <Text variant="caption" color="white" style={styles.flex}>
            {t('thread.offline')}
          </Text>
        </View>
      ) : null}

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {thread.loading ? (
          <ActivityIndicator color={colors.ink} style={styles.loading} />
        ) : thread.closed ? (
          <Text variant="body" color="text3" style={styles.closed}>
            {t('thread.closed')}
          </Text>
        ) : thread.error ? (
          <Text variant="body" style={styles.closed}>
            {errorMessage(thread.error)}
          </Text>
        ) : (
          <FlatList
            inverted
            data={rows}
            keyExtractor={(r) => r.key}
            renderItem={renderRow}
            onEndReached={() => thread.loadOlder()}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {!thread.closed ? (
          <View style={styles.compose}>
            <TextInput
              testID="thread-input"
              accessibilityLabel={t('thread.placeholder', { name })}
              value={text}
              onChangeText={(value) => {
                setText(value);
                if (value) thread.typing();
              }}
              placeholder={t('thread.placeholder', { name })}
              placeholderTextColor={colors.muted}
              multiline
              maxLength={MAX_LENGTH}
              style={styles.input}
            />
            <Pressable
              testID="thread-send"
              accessibilityRole="button"
              accessibilityLabel={t('thread.send')}
              onPress={submit}
              disabled={!text.trim()}
              style={[styles.send, !text.trim() && styles.disabled]}
            >
              <Feather name="send" size={20} color={colors.ink} />
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <Modal visible={menu} transparent animationType="slide" onRequestClose={() => setMenu(false)}>
        <Pressable style={styles.scrim} onPress={() => setMenu(false)} />
        <View style={styles.sheet}>
          <View style={styles.grab} />
          <View style={styles.sheetTitle}>
            {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.sheetAvatar} contentFit="cover" /> : null}
            <Text variant="label">{name}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMenu(false);
              setConfirmUnmatch(true);
            }}
            style={styles.menuItem}
          >
            <Feather name="user-x" size={20} color={colors.ink} />
            <Text variant="label">{t('thread.unmatch')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setMenu(false)} style={styles.cancel}>
            <Text variant="label">{t('common.cancel')}</Text>
          </Pressable>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmUnmatch}
        title={t('thread.unmatchTitle', { name })}
        message={t('thread.unmatchBody')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('thread.unmatch')}
        onCancel={() => setConfirmUnmatch(false)}
        onConfirm={() => void doUnmatch()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.ink,
  },
  loading: { marginTop: 40 },
  closed: { padding: 24, textAlign: 'center' },
  messages: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  day: { alignSelf: 'center', marginVertical: 4 },
  system: {
    alignSelf: 'center',
    maxWidth: 300,
    padding: 14,
    gap: 4,
    borderRadius: radius.control,
    backgroundColor: colors.accentTint,
    marginBottom: 6,
  },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  in: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  outWrap: { alignItems: 'flex-end' },
  out: { backgroundColor: colors.accent, borderBottomRightRadius: 6 },
  outText: { fontFamily: fonts.semibold },
  pendingBubble: { opacity: 0.6 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginRight: 4 },
  compose: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.page,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 23,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.page,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },
  grab: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 12 },
  sheetTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: 6,
  },
  sheetAvatar: { width: 44, height: 44, borderRadius: 22 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 56 },
  cancel: {
    marginTop: 10,
    height: 52,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
