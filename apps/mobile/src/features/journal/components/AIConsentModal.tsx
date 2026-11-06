import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors } from '../../../constants/colors';
import { triggerHaptic } from '../../../utils/haptics';

interface AIConsentModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AIConsentModal: React.FC<AIConsentModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>✦</Text>
          </View>

          <Text style={styles.title}>AI Reflection Privacy</Text>

          <Text style={styles.description}>
            Solace AI can provide gentle, supportive reflections on this specific journal
            entry.
          </Text>

          <View style={styles.privacyBox}>
            <Text style={styles.privacyHeader}>Our Strict Privacy Promise:</Text>
            <Text style={styles.privacyItem}>• Your journal is NEVER used to train AI models.</Text>
            <Text style={styles.privacyItem}>• Only this single entry is processed for reflection.</Text>
            <Text style={styles.privacyItem}>• It is never shared with other users or services.</Text>
            <Text style={styles.privacyItem}>• You can delete your entries and reflections anytime.</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                triggerHaptic.light();
                onCancel();
              }}
            >
              <Text style={styles.cancelText}>Keep Completely Private</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                triggerHaptic.medium();
                onConfirm();
              }}
            >
              <Text style={styles.confirmText}>I Consent & Reflect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.lavender,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 24,
    color: colors.sageDark,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  privacyBox: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  privacyHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sageDark,
    marginBottom: 6,
  },
  privacyItem: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginVertical: 1,
  },
  buttonRow: {
    width: '100%',
    gap: 10,
  },
  confirmBtn: {
    backgroundColor: colors.sage,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: colors.cream,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

