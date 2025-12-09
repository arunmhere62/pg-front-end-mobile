import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
} from 'react-native';
import { NetworkLog } from '../utils/networkLogger';

interface RequestDetailsComponentProps {
  log: NetworkLog;
  onBack?: () => void;
}

export const RequestDetailsComponent: React.FC<RequestDetailsComponentProps> = ({
  log,
  onBack,
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    request: boolean;
    response: boolean;
    headers: boolean;
  }>({
    request: true,
    response: true,
    headers: false,
  });

  const getStatusColor = (status?: number) => {
    if (!status) return '#999';
    if (status >= 200 && status < 300) return '#10B981';
    if (status >= 400) return '#EF4444';
    return '#F59E0B';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return '#3B82F6';
      case 'POST':
        return '#10B981';
      case 'PUT':
        return '#F59E0B';
      case 'DELETE':
        return '#EF4444';
      case 'PATCH':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCopyData = (data: any, label: string) => {
    Clipboard.setString(formatJson(data));
    Alert.alert('Success', `${label} copied to clipboard!`);
  };

  const renderCollapsibleSection = (
    title: string,
    sectionKey: keyof typeof expandedSections,
    content: string,
    color?: string
  ) => (
    <View style={styles.section}>
      <TouchableOpacity
        onPress={() => toggleSection(sectionKey)}
        style={styles.sectionHeader}
      >
        <Text style={[styles.sectionTitle, color ? { color } : {}]}>
          {expandedSections[sectionKey] ? '▼' : '▶'} {title}
        </Text>
      </TouchableOpacity>
      {expandedSections[sectionKey] && (
        <View style={styles.sectionContent}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <Text style={[styles.dataText, color ? { color } : {}]} selectable>
              {content}
            </Text>
          </ScrollView>
          <TouchableOpacity
            onPress={() => handleCopyData(content, title)}
            style={styles.copyButton}
          >
            <Text style={styles.copyButtonText}>📋 Copy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Method</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: getMethodColor(log.method) },
              ]}
            >
              {log.method}
            </Text>
          </View>
          {log.status && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: getStatusColor(log.status) },
                ]}
              >
                {log.status}
              </Text>
            </View>
          )}
          {log.duration && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{log.duration}ms</Text>
            </View>
          )}
        </View>

        <View style={styles.urlSection}>
          <Text style={styles.summaryLabel}>URL</Text>
          <Text style={styles.urlText} numberOfLines={2}>
            {log.url}
          </Text>
        </View>

        <Text style={styles.timestampText}>
          {log.timestamp.toLocaleString()}
        </Text>
      </View>

      {/* Request Data */}
      {log.requestData &&
        renderCollapsibleSection(
          '📤 Request Data',
          'request',
          formatJson(log.requestData),
          '#F59E0B'
        )}

      {/* Response Data */}
      {log.responseData &&
        renderCollapsibleSection(
          '📥 Response Data',
          'response',
          formatJson(log.responseData),
          '#10B981'
        )}

      {/* Headers */}
      {log.headers &&
        renderCollapsibleSection(
          '📋 Headers',
          'headers',
          formatJson(log.headers),
          '#60A5FA'
        )}

      {/* Error */}
      {log.error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{log.error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  urlSection: {
    marginBottom: 12,
  },
  urlText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sectionContent: {
    marginTop: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  dataText: {
    fontSize: 11,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  copyButton: {
    marginTop: 12,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  errorSection: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
  },
});
