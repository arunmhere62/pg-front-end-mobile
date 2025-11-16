import React from 'react';
import {
  View,
  Image,
  Modal,
  TouchableOpacity,
  Text,
} from 'react-native';

interface ImageViewerModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>×</Text>
        </TouchableOpacity>

        {/* Full Screen Image */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
};
