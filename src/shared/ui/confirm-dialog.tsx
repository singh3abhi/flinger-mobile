import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/core/theme/tokens';
import { Text } from './text';

/** Centered two-button alert in the app's style (cancel on the left, confirm on the right). */
export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <View style={styles.card} accessibilityRole="alert" accessibilityViewIsModal>
          <Text variant="label" style={styles.title}>
            {title}
          </Text>
          <Text variant="body" color="text2" style={styles.message}>
            {message}
          </Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.action}>
              <Text variant="bodyLg">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              testID="confirm-dialog-confirm"
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.action, styles.divider]}
            >
              <Text variant="label" color="accentInk">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 18,
    backgroundColor: colors.page,
    overflow: 'hidden',
  },
  title: { textAlign: 'center', fontSize: 18, paddingTop: 22, paddingHorizontal: 20 },
  message: { textAlign: 'center', paddingTop: 6, paddingBottom: 20, paddingHorizontal: 20 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line },
  action: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  divider: { borderLeftWidth: 1, borderLeftColor: colors.line },
});
