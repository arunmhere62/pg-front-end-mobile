import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SlideBottomModal } from './SlideBottomModal';
import { networkLogger, NetworkLog } from '../utils/networkLogger';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NetworkLoggerSlideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NetworkLoggerSlideModal: React.FC<NetworkLoggerSlideModalProps> = ({
  visible,
  onClose,
}) => {
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<NetworkLog | null>(null);

  useEffect(() => {
    if (visible) {
      const currentLogs = networkLogger.getLogs();
      setLogs(currentLogs);
      setSelectedLog(null);
    }
  }, [visible]);

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

  const renderLogsList = () => (
    <ScrollView style={styles.logsList}>
      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No network requests logged</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Total: {logs.length} | Success: {logs.filter(l => l.status && l.status >= 200 && l.status < 300).length} | Errors: {logs.filter(l => l.status && l.status >= 400).length}
            </Text>
          </View>

          {logs.map((log, index) => (
            <TouchableOpacity
              key={`${log.id}-${index}`}
              style={styles.logItem}
              onPress={() => setSelectedLog(log)}
            >
              <View style={styles.logHeader}>
                <Text style={[styles.method, { color: getMethodColor(log.method) }]}>
                  {log.method}
                </Text>
                <Text style={[styles.status, { color: getStatusColor(log.status) }]}>
                  {log.status || 'PENDING'}
                </Text>
                {log.duration && (
                  <Text style={styles.duration}>{log.duration}ms</Text>
                )}
              </View>
              <Text style={styles.url} numberOfLines={1}>
                {log.url}
              </Text>
              <Text style={styles.timestamp}>
                {log.timestamp.toLocaleTimeString()}
              </Text>
              {log.error && (
                <Text style={styles.error}>❌ {log.error}</Text>
              )}
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderLogDetails = () => {
    if (!selectedLog) return null;

    return (
      <ScrollView style={styles.detailsScroll}>
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Request Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Method:</Text>
            <Text style={[styles.detailValue, { color: getMethodColor(selectedLog.method) }]}>
              {selectedLog.method}
            </Text>
          </View>

          {selectedLog.status && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, { color: getStatusColor(selectedLog.status) }]}>
                {selectedLog.status}
              </Text>
            </View>
          )}

          {selectedLog.duration && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{selectedLog.duration}ms</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>URL:</Text>
            <Text style={[styles.detailValue, { flex: 1 }]} numberOfLines={2}>
              {selectedLog.url}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>
              {selectedLog.timestamp.toLocaleString()}
            </Text>
          </View>

          {selectedLog.requestData && (
            <View style={styles.dataSection}>
              <Text style={styles.dataTitle}>📤 Request:</Text>
              <Text style={styles.dataText}>
                {typeof selectedLog.requestData === 'string'
                  ? selectedLog.requestData
                  : JSON.stringify(selectedLog.requestData, null, 2)}
              </Text>
            </View>
          )}

          {selectedLog.responseData && (
            <View style={styles.dataSection}>
              <Text style={styles.dataTitle}>📥 Response:</Text>
              <Text style={styles.dataText}>
                {typeof selectedLog.responseData === 'string'
                  ? selectedLog.responseData
                  : JSON.stringify(selectedLog.responseData, null, 2)}
              </Text>
            </View>
          )}

          {selectedLog.error && (
            <View style={styles.errorSection}>
              <Text style={styles.errorTitle}>❌ Error:</Text>
              <Text style={styles.errorText}>{selectedLog.error}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <SlideBottomModal
      visible={visible}
      onClose={onClose}
      title={selectedLog ? 'Request Details' : 'Network Logs'}
      subtitle={selectedLog ? selectedLog.url : `${logs.length} requests`}
      cancelLabel={selectedLog ? 'Back' : 'Close'}
      onCancel={() => {
        if (selectedLog) {
          setSelectedLog(null);
        } else {
          onClose();
        }
      }}
    >
      {selectedLog ? renderLogDetails() : renderLogsList()}
    </SlideBottomModal>
  );
};

const styles = StyleSheet.create({
  logsList: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginHorizontal: 4,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  method: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 40,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  duration: {
    fontSize: 11,
    color: '#999',
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
  },
  error: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  detailsScroll: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 70,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  dataSection: {
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  dataText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  errorSection: {
    marginTop: 12,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 11,
    color: '#991B1B',
  },
});
