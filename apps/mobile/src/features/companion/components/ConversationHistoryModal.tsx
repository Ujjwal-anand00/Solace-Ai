import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import {
  AppHeading,
  AppText,
  AppIcon,
  AppButton,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import {
  useConversations,
  useDeleteConversation,
  useUpdateConversation,
} from '../../../hooks/useConversations';
import { Conversation } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface ConversationHistoryModalProps {
  visible: boolean;
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onClose: () => void;
}

export const ConversationHistoryModal: React.FC<ConversationHistoryModalProps> = ({
  visible,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onClose,
}) => {
  const { colors } = useTheme();
  const { data: conversationsData, isLoading } = useConversations();
  const deleteMutation = useDeleteConversation();
  const updateMutation = useUpdateConversation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const conversations = conversationsData?.data || [];

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleDelete = (item: Conversation) => {
    triggerHaptic.warning();
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMutation.mutateAsync(item.id);
            if (activeConversationId === item.id) {
              onNewConversation();
            }
          },
        },
      ],
    );
  };

  const handleStartRename = (item: Conversation) => {
    triggerHaptic.selection();
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const handleSaveRename = async () => {
    if (editingId && editingTitle.trim()) {
      triggerHaptic.selection();
      await updateMutation.mutateAsync({
        id: editingId,
        dto: { title: editingTitle.trim() },
      });
      setEditingId(null);
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const isActive = item.id === activeConversationId;
    const isEditing = editingId === item.id;

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: isActive ? colors.primaryLight : colors.surface,
            borderColor: isActive ? colors.primaryDark : colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.itemMain}
          onPress={() => {
            triggerHaptic.selection();
            onSelectConversation(item.id);
            onClose();
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.itemIcon, { backgroundColor: colors.surfaceVariant }]}>
            <AppIcon
              name="messageCircle"
              size={16}
              color={isActive ? colors.primaryDark : colors.textSecondary}
            />
          </View>

          <View style={styles.itemTexts}>
            {isEditing ? (
              <View style={styles.renameRow}>
                <TextInput
                  style={[styles.renameInput, { color: colors.textPrimary, borderColor: colors.primary }]}
                  value={editingTitle}
                  onChangeText={setEditingTitle}
                  autoFocus
                  onBlur={handleSaveRename}
                  onSubmitEditing={handleSaveRename}
                />
                <TouchableOpacity onPress={handleSaveRename} style={styles.renameCheck}>
                  <AppIcon name="check" size={16} color={colors.primaryDark} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <AppText
                  variant="bodyMedium"
                  style={[
                    styles.itemTitle,
                    { color: isActive ? colors.primaryDark : colors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  {formatDate(item.lastMessageAt || item.createdAt)}
                </AppText>
              </>
            )}
          </View>
        </TouchableOpacity>

        {!isEditing && (
          <View style={styles.itemActions}>
            <TouchableOpacity
              onPress={() => handleStartRename(item)}
              style={styles.actionIconBtn}
              accessibilityLabel="Rename conversation"
            >
              <AppIcon name="feather" size={14} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.actionIconBtn}
              accessibilityLabel="Delete conversation"
            >
              <AppIcon name="trash" size={14} color="#E53E3E" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.titleWithIcon}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="history" size={18} color={colors.primaryDark} />
              </View>
              <AppHeading level="h4" style={styles.modalTitle}>
                Conversations
              </AppHeading>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
              accessibilityLabel="Close conversation history"
            >
              <AppIcon name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* New Chat Button */}
          <View style={styles.topActionWrap}>
            <AppButton
              title="Start New Conversation"
              variant="primary"
              size="md"
              onPress={() => {
                triggerHaptic.selection();
                onNewConversation();
                onClose();
              }}
              fullWidth
            />
          </View>

          {/* List */}
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppText variant="bodyMedium" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                  {isLoading ? 'Loading conversations...' : 'No conversations yet. Start one anytime!'}
                </AppText>
              </View>
            }
          />
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
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActionWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 20,
    gap: 10,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTexts: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  renameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
  },
  renameCheck: {
    padding: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionIconBtn: {
    padding: 6,
  },
});
