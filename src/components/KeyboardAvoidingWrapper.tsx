import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  enableAutomaticScroll?: boolean;
}

/**
 * Root-level keyboard avoiding wrapper that handles keyboard properly on all devices
 * 
 * Features:
 * - Prevents content from being pushed to top on keyboard open
 * - Handles notches, punch holes, and dynamic islands
 * - Works on both iOS and Android
 * - Dismisses keyboard on tap outside
 * - Smooth scrolling when keyboard appears
 * 
 * Usage:
 * <KeyboardAvoidingWrapper>
 *   <YourContent />
 * </KeyboardAvoidingWrapper>
 */
export const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  enableAutomaticScroll = true,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            bounces={enableAutomaticScroll}
            scrollEnabled={enableAutomaticScroll}
          >
            {children}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
