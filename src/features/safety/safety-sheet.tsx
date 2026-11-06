import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Text } from '@/shared/ui/text';
import { block } from './api';
import { notifyBlocked } from './blocked-events';

export interface ExtraAction {
  label: string;
  icon: ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}

export function reportHref(p: { userId: string; name: string; targetType?: string; targetId?: string }): Href {
  const q = new URLSearchParams({
    userId: p.userId,
    name: p.name,
    targetType: p.targetType ?? 'user',
    ...(p.targetId ? { targetId: p.targetId } : {}),
  });
  return `/report?${q.toString()}` as Href;
}

/** After a block, everything that might show that person is stale. */
export function useForgetPerson() {
  const queryClient = useQueryClient();
  return (userId: string) => {
    notifyBlocked(userId);
    return queryClient.invalidateQueries();
  };
}

/**
 * Options for another member: (extra actions such as Unmatch), Report, Block. Blocking asks first,
 * then `onBlocked` runs (usually: leave the screen).
 */
export function SafetySheet({
  visible,
  onClose,
  userId,
  name,
  extra = [],
  onBlocked,
}: {
  visible: boolean;
  onClose: () => void;
  userId: string;
  name: string;
  extra?: ExtraAction[];
  onBlocked: () => void;
}) {
  const { t } = useTranslation();
  const forget = useForgetPerson();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  const doBlock = async () => {
    setConfirming(false);
    try {
      await block(userId);
      await forget(userId);
      onBlocked();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const item = (label: string, icon: ExtraAction['icon'], onPress: () => void, danger = false) => (
    <Pressable key={label} accessibilityRole="button" onPress={onPress} style={styles.item}>
      <Feather name={icon} size={20} color={danger ? colors.danger : colors.ink} />
      <Text variant="label" color={danger ? 'danger' : 'ink'}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel={t('common.close')} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.grab} />
          <Text variant="label" style={styles.title}>
            {name}
          </Text>
          {extra.map((a) =>
            item(a.label, a.icon, () => {
              onClose();
              a.onPress();
            }),
          )}
          {item(t('safety.report'), 'flag', () => {
            onClose();
            router.push(reportHref({ userId, name }));
          })}
          {item(
            t('safety.block'),
            'slash',
            () => {
              onClose();
              setConfirming(true);
            },
            true,
          )}
          {error ? (
            <Text variant="caption" color="danger">
              {error}
            </Text>
          ) : null}
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text variant="label">{t('common.cancel')}</Text>
          </Pressable>
        </View>
      </Modal>
      <ConfirmDialog
        visible={confirming}
        title={t('safety.blockTitle', { name })}
        message={t('safety.blockBody')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('safety.block')}
        onCancel={() => setConfirming(false)}
        onConfirm={() => void doBlock()}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  title: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: 6,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 56 },
  cancel: {
    marginTop: 10,
    height: 52,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
