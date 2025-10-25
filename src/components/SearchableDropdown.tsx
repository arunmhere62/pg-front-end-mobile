import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { Theme } from '../theme';

interface DropdownItem {
  id: number;
  label: string;
  value: any;
}

interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  items: DropdownItem[];
  selectedValue: number | null;
  onSelect: (item: DropdownItem) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  placeholder,
  items,
  selectedValue,
  onSelect,
  loading = false,
  disabled = false,
  error = '',
  required = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>(items);
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const selectedItem = items.find((item) => item.id === selectedValue);

  const openModal = () => {
    if (disabled || loading) return;
    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSearchQuery('');
    });
  };

  const handleSelect = (item: DropdownItem) => {
    onSelect(item);
    closeModal();
  };

  const renderItem = ({ item }: { item: DropdownItem }) => {
    const isSelected = item.id === selectedValue;
    return (
      <TouchableOpacity
        style={[
          styles.dropdownItem,
          isSelected && styles.selectedItem,
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownItemText,
            isSelected && styles.selectedItemText,
          ]}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      {/* Dropdown Button */}
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          error && styles.dropdownButtonError,
          disabled && styles.dropdownButtonDisabled,
        ]}
        onPress={openModal}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Theme.colors.primary} />
        ) : (
          <>
            <Text
              style={[
                styles.dropdownButtonText,
                !selectedItem && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {selectedItem ? selectedItem.label : placeholder}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Items List */}
            {filteredItems.length > 0 ? (
              <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search
                </Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
    marginLeft: 2,
    fontWeight: '600',
  },
  required: {
    color: '#EF4444',
  },
  dropdownButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  dropdownButtonError: {
    borderColor: '#EF4444',
  },
  dropdownButtonDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  dropdownButtonText: {
    fontSize: 13,
    color: Theme.colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
    fontSize: 13,
  },
  dropdownIcon: {
    fontSize: 10,
    color: Theme.colors.text.secondary,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 3,
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: Theme.colors.text.primary,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  list: {
    maxHeight: 350,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedItem: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 13,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  selectedItemText: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: Theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: 3,
  },
  emptySubtext: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    opacity: 0.7,
  },
});
