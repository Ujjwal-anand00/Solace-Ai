import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../../constants/colors';
import { triggerHaptic } from '../../../utils/haptics';

interface AccountDeletionModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [confirmInput, setConfirmInput] = useState('');

  const handleDelete = () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Confirmation required', 'Please type DELETE exactly to confirm.');
      return;
    }
    triggerHaptic.heavy();
    onConfirm();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Delete Account Permanently</Text>
          <Text style={styles.desc}>
            This action is irreversible. All of your mood records, private journal reflections,
            wellness plans, and AI conversation history will be permanently deleted immediately.
          </Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Type DELETE to confirm:</Text>
            <TextInput
              style={styles.input}
              placeholder="DELETE"
              placeholderTextColor={colors.textLight}
              value={confirmInput}
              onChangeText={setConfirmInput}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={isLoading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteBtn,
                confirmInput.trim().toUpperCase() !== 'DELETE' && styles.deleteBtnDisabled,
              ]}
              onPress={handleDelete}
              disabled={isLoading || confirmInput.trim().toUpperCase() !== 'DELETE'}
            >
              <Text style={styles.deleteText}>{isLoading ? 'Deleting...' : 'Delete Forever'}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E11D48',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputWrap: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.cream,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E11D48',
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    opacity: 0.4,
  },
  deleteText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '700',
  },
});

