import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { HardShadow } from '@/shared/ui/hard-shadow';
import { Text } from '@/shared/ui/text';
import type { LikeTarget } from './profile-card';

const COMMENT_MAX = 150;

function BottomSheet({
  visible,
  onClose,
  children,
  label,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel={label} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.grab} />
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Send a like on one photo or prompt, with an optional comment. */
export function LikeSheet({
  name,
  target,
  likesRemaining,
  sending,
  error,
  onSend,
  onClose,
}: {
  name: string;
  target: LikeTarget | null;
  likesRemaining: number | null;
  sending: boolean;
  error?: string;
  onSend: (comment?: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const close = () => {
    setComment('');
    onClose();
  };
  const send = (withComment: boolean) => {
    const text = comment.trim();
    onSend(withComment && text ? text : undefined);
    setComment('');
  };

  return (
    <BottomSheet visible={target !== null} onClose={close} label={t('common.close')}>
      <View style={styles.header}>
        <Text variant="headline" accessibilityRole="header" style={styles.title}>
          {target?.type === 'prompt'
            ? t('discover.like.titlePrompt', { name })
            : t('discover.like.titlePhoto', { name })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={close}
          style={styles.close}
        >
          <Feather name="x" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.target}>
        {target?.type === 'photo' ? (
          <Image source={{ uri: target.url }} style={styles.thumb} contentFit="cover" />
        ) : null}
        <View style={styles.flex}>
          <Text variant="label" numberOfLines={2}>
            {target?.type === 'photo'
              ? t('discover.like.photoN', { n: target.index + 1 })
              : target?.type === 'prompt'
                ? target.answer
                : ''}
          </Text>
          {likesRemaining !== null ? (
            <Text variant="caption" color="text3">
              {t('discover.like.left', { count: likesRemaining })}
            </Text>
          ) : null}
        </View>
      </View>

      <Text variant="label" style={styles.label}>
        {t('discover.like.commentLabel')}
      </Text>
      <HardShadow>
        <TextInput
          testID="like-comment"
          accessibilityLabel={t('discover.like.commentLabel')}
          value={comment}
          onChangeText={setComment}
          maxLength={COMMENT_MAX}
          multiline
          placeholder={t('discover.like.commentPlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.comment}
        />
      </HardShadow>
      <Text variant="small" color="muted" style={styles.count}>
        {comment.length} / {COMMENT_MAX}
      </Text>
      {error ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      <Button
        testID="like-send"
        label={t('discover.like.send')}
        onPress={() => send(true)}
        loading={sending}
        style={styles.send}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => send(false)}
        disabled={sending}
        style={styles.alt}
      >
        <Text variant="label" color="text2" style={styles.underline}>
          {t('discover.like.sendWithout')}
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

/** Shown when the daily likes are used up. */
export function LimitSheet({
  visible,
  perDay,
  resetsAt,
  onClose,
}: {
  visible: boolean;
  perDay: number;
  resetsAt: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const minutes = resetsAt ? Math.max(0, Math.round((Date.parse(resetsAt) - Date.now()) / 60000)) : 0;
  return (
    <BottomSheet visible={visible} onClose={onClose} label={t('common.close')}>
      <View style={styles.center}>
        <View style={styles.badge}>
          <Feather name="heart" size={28} color={colors.accentInk} />
        </View>
        <Text variant="headline" accessibilityRole="header" style={styles.centerText}>
          {t('discover.limit.title', { count: perDay })}
        </Text>
        <Text variant="body" color="text2" style={[styles.centerText, styles.label]}>
          {t('discover.limit.body')}
        </Text>
        <Text variant="small" color="text3" style={styles.label}>
          {t('discover.limit.resetsIn', { h: Math.floor(minutes / 60), m: minutes % 60 })}
        </Text>
      </View>
      <Button variant="dark" label={t('discover.limit.ok')} onPress={onClose} style={styles.send} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.page,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },
  grab: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
    marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  title: { flex: 1, fontSize: 20 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  target: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  thumb: { width: 56, height: 70, borderRadius: radius.thumb },
  label: { marginTop: 16, marginBottom: 8 },
  comment: {
    minHeight: 96,
    borderRadius: radius.control,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  count: { textAlign: 'right', marginTop: 8 },
  send: { marginTop: 14 },
  alt: { alignItems: 'center', marginTop: 14, minHeight: 32, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
