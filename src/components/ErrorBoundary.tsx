import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../theme';
import { openNetworkLogger } from './NetworkLoggerModal';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);
    console.error('🔴 Component Stack:', errorInfo.componentStack);
    console.error('🔴 Error Stack:', error.stack);
    
    this.setState({
      error,
      errorInfo,
    });
    
    // Log to any crash reporting service here if needed
    // Example: Crashlytics.recordError(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{
          flex: 1,
          backgroundColor: Theme.colors.background.blue,
          padding: 20,
          justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: Theme.colors.danger,
              marginBottom: 12,
              textAlign: 'center',
            }}>
              ⚠️ Something went wrong
            </Text>

            <Text style={{
              fontSize: 14,
              color: Theme.colors.text.secondary,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              The app encountered an unexpected error. Please try again.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={{
                maxHeight: 200,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#666',
                  fontFamily: 'monospace',
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </Text>
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={this.handleReset}
              style={{
                backgroundColor: Theme.colors.primary,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                try {
                  openNetworkLogger();
                } catch (error) {
                  console.error('Failed to open network logger:', error);
                }
              }}
              style={{
                backgroundColor: '#10B981',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>🔍</Text>
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}>
                View Network Logs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
