import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accelerometer } from 'expo-sensors';
import { networkLogger, NetworkLog } from '../utils/networkLogger';

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Button size
const BUTTON_SIZE = 56;

// Safe area boundaries (prevent blocking system gestures)
const BOUNDARY_PADDING = 10; // Minimum distance from edges
const TOP_SAFE_AREA = 50; // Extra space for status bar/notch
const BOTTOM_SAFE_AREA = 80; // Extra space for gesture bar/navigation

// Global function to open logger from anywhere
let globalOpenLogger: (() => void) | null = null;

export const openNetworkLogger = () => {
  if (globalOpenLogger) {
    globalOpenLogger();
  } else {
    console.warn('Network logger not initialized yet');
  }
};

export const NetworkLoggerModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<NetworkLog | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    headers: boolean;
    request: boolean;
    response: boolean;
    curl: boolean;
  }>({
    headers: false,
    request: true,
    response: true,
    curl: false,
  });

  // Floating button position
  const pan = useState(new Animated.ValueXY({ x: 20, y: 100 }))[0];

  // Register global open function
  useEffect(() => {
    globalOpenLogger = () => {
      const currentLogs = networkLogger.getLogs();
      setLogs(currentLogs);
      setVisible(true);
    };
    return () => {
      globalOpenLogger = null;
    };
  }, []);

  // Refresh logs when modal becomes visible
  useEffect(() => {
    if (visible) {
      const currentLogs = networkLogger.getLogs();
      setLogs(currentLogs);
    }
  }, [visible]);

  useEffect(() => {
    let subscription: any;
    const SHAKE_THRESHOLD = 2.0; // Lowered threshold for easier detection
    let lastUpdate = 0;
    const SHAKE_TIMEOUT = 800; // Reduced timeout for better responsiveness

    const setupAccelerometer = async () => {
      try {
        // Request permission and check availability
        const { status } = await Accelerometer.requestPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('Accelerometer permission not granted');
          return;
        }

        const isAvailable = await Accelerometer.isAvailableAsync();
        
        if (!isAvailable) {
          console.log('Accelerometer not available on this device');
          return;
        }

        Accelerometer.setUpdateInterval(100);

        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const currentTime = Date.now();
          if (currentTime - lastUpdate < SHAKE_TIMEOUT) return;

          const acceleration = Math.sqrt(x * x + y * y + z * z);
          
          // Only log when shake is detected (not every frame)
          if (acceleration > SHAKE_THRESHOLD) {
            lastUpdate = currentTime;
            console.log('✅ Shake detected! Acceleration:', acceleration.toFixed(2));
            const currentLogs = networkLogger.getLogs();
            setLogs(currentLogs);
            setVisible(true);
          }
        });

        console.log('📱 Network Logger: Shake to open (threshold:', SHAKE_THRESHOLD, ')');
      } catch (error) {
        console.error('Error setting up accelerometer:', error);
      }
    };

    setupAccelerometer();

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  const getStatusColor = (status?: number) => {
    if (!status) return '#999';
    if (status >= 200 && status < 300) return '#10B981';
    if (status >= 400) return '#EF4444';
    return '#F59E0B';
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getDataSummary = (data: any): string => {
    if (!data) return 'No data';
    try {
      const jsonStr = JSON.stringify(data);
      const size = new Blob([jsonStr]).size;
      const sizeKB = (size / 1024).toFixed(2);
      
      if (Array.isArray(data)) {
        return `Array (${data.length} items, ${sizeKB} KB)`;
      } else if (typeof data === 'object') {
        const keys = Object.keys(data);
        
        // Check for common API response pattern with data array
        if (data.data && Array.isArray(data.data)) {
          return `Object (${keys.length} keys, data: ${data.data.length} items, ${sizeKB} KB)`;
        }
        
        return `Object (${keys.length} keys, ${sizeKB} KB)`;
      }
      return `${sizeKB} KB`;
    } catch {
      return 'Invalid data';
    }
  };

  const formatLargeData = (data: any, maxItems: number = 5): { preview: string; isTruncated: boolean; fullSize: number } => {
    if (!data) return { preview: 'No data', isTruncated: false, fullSize: 0 };
    
    try {
      const fullJson = JSON.stringify(data);
      const fullSize = new Blob([fullJson]).size;
      
      // If data is small enough, return full data
      if (fullSize < 50000) { // Less than 50KB
        return { preview: JSON.stringify(data, null, 2), isTruncated: false, fullSize };
      }
      
      // For large data, create a preview
      let previewData: any;
      
      if (Array.isArray(data)) {
        // Show first few items for arrays
        previewData = data.slice(0, maxItems);
        const preview = JSON.stringify(previewData, null, 2);
        return {
          preview: preview + `\n\n... and ${data.length - maxItems} more items (showing ${maxItems} of ${data.length})`,
          isTruncated: true,
          fullSize
        };
      } else if (typeof data === 'object') {
        // For objects, check if it's a common API response pattern
        const keys = Object.keys(data);
        previewData = {};
        
        keys.forEach(key => {
          const value = data[key];
          
          // Handle common API response structure
          if (key === 'data' && Array.isArray(value) && value.length > 0) {
            // Show first few items of the data array
            previewData[key] = value.slice(0, maxItems);
            if (value.length > maxItems) {
              previewData[`_${key}_info`] = `... ${value.length - maxItems} more items (${value.length} total)`;
            }
          } else if (Array.isArray(value)) {
            if (value.length <= 3) {
              previewData[key] = value; // Show small arrays fully
            } else {
              previewData[key] = value.slice(0, 2);
              previewData[`_${key}_info`] = `... ${value.length - 2} more items (${value.length} total)`;
            }
          } else if (typeof value === 'object' && value !== null) {
            const objKeys = Object.keys(value);
            if (objKeys.length <= 5) {
              previewData[key] = value; // Show small objects fully
            } else {
              previewData[key] = `{Object with ${objKeys.length} keys}`;
            }
          } else {
            previewData[key] = value; // Show primitives fully
          }
        });
        
        const preview = JSON.stringify(previewData, null, 2);
        return {
          preview,
          isTruncated: true,
          fullSize
        };
      }
      
      return { preview: fullJson.substring(0, 5000) + '\n\n... (truncated)', isTruncated: true, fullSize };
    } catch (error) {
      return { preview: 'Error formatting data: ' + error, isTruncated: false, fullSize: 0 };
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getLogStats = () => {
    const total = logs.length;
    const success = logs.filter(l => l.status && l.status >= 200 && l.status < 300).length;
    const errors = logs.filter(l => l.status && l.status >= 400).length;
    const avgDuration = logs.reduce((acc, l) => acc + (l.duration || 0), 0) / (total || 1);
    return { total, success, errors, avgDuration: Math.round(avgDuration) };
  };

  const generateCurl = (log: NetworkLog): string => {
    let curl = `curl -X ${log.method} '${log.url}'`;

    // Add headers
    if (log.headers) {
      Object.entries(log.headers).forEach(([key, value]) => {
        curl += ` \\\n  -H '${key}: ${value}'`;
      });
    }

    // Add request body
    if (log.requestData) {
      const body = typeof log.requestData === 'string' 
        ? log.requestData 
        : JSON.stringify(log.requestData);
      curl += ` \\\n  -d '${body}'`;
    }

    return curl;
  };

  const handleCopyCurl = () => {
    if (!selectedLog) return;
    
    const curlCommand = generateCurl(selectedLog);
    Clipboard.setString(curlCommand);
    Alert.alert('Success', 'CURL command copied to clipboard!');
  };

  const renderLogItem = (log: NetworkLog) => (
    <TouchableOpacity
      key={log.id}
      style={styles.logItem}
      onPress={() => handleLogPress(log)}
    >
      <View style={styles.logHeader}>
        <View style={styles.methodContainer}>
          <Text style={[styles.method, { color: getStatusColor(log.status) }]}>
            {log.method}
          </Text>
          {log.status && (
            <Text style={[styles.status, { color: getStatusColor(log.status) }]}>
              {log.status}
            </Text>
          )}
        </View>
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
        <Text style={styles.error} numberOfLines={1}>
          ❌ {log.error}
        </Text>
      )}
    </TouchableOpacity>
  );

  const handleLogPress = (log: NetworkLog) => {
    setSelectedLog(log);
    setVisible(false);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
    setVisible(true);
  };

  const renderCollapsibleSection = (
    title: string,
    sectionKey: keyof typeof expandedSections,
    content: string,
    summary?: string,
    color?: string,
    isTruncated?: boolean,
    onCopy?: () => void
  ) => (
    <View style={styles.detailSection}>
      <TouchableOpacity 
        onPress={() => toggleSection(sectionKey)}
        style={styles.sectionHeader}
      >
        <Text style={[styles.sectionTitle, color ? { color } : {}]}>
          {expandedSections[sectionKey] ? '▼' : '▶'} {title}
        </Text>
        {summary && (
          <Text style={styles.sectionSummary}>{summary}</Text>
        )}
      </TouchableOpacity>
      {expandedSections[sectionKey] && (
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.jsonContainer}
            nestedScrollEnabled={true}
          >
            <ScrollView 
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <Text style={[styles.jsonText, color ? { color } : {}]}>
                {content}
              </Text>
            </ScrollView>
          </ScrollView>
          {isTruncated && (
            <View style={styles.truncatedWarning}>
              <Text style={styles.truncatedText}>⚠️ Large data truncated for preview</Text>
              {onCopy && (
                <TouchableOpacity onPress={onCopy} style={styles.copyDataButton}>
                  <Text style={styles.copyDataButtonText}>📋 Copy Full Data</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderLogDetails = () => {
    if (!selectedLog) return null;

    return (
      <Modal visible={!!selectedLog} animationType="slide" onRequestClose={handleCloseDetails}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.detailsContainer}>
            <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Request Details</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleCopyCurl}
                style={styles.curlButton}
              >
                <Text style={styles.curlButtonText}>📋 Copy CURL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCloseDetails}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.detailsScroll}>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Method</Text>
                  <Text style={[styles.summaryValue, { color: getStatusColor(selectedLog.status) }]}>
                    {selectedLog.method}
                  </Text>
                </View>
                {selectedLog.status && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Status</Text>
                    <Text style={[styles.summaryValue, { color: getStatusColor(selectedLog.status) }]}>
                      {selectedLog.status}
                    </Text>
                  </View>
                )}
                {selectedLog.duration && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Duration</Text>
                    <Text style={styles.summaryValue}>{selectedLog.duration}ms</Text>
                  </View>
                )}
              </View>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryItem, { flex: 1 }]}>
                  <Text style={styles.summaryLabel}>URL</Text>
                  <Text style={styles.summaryUrl} numberOfLines={2}>
                    {selectedLog.url}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Request Size</Text>
                  <Text style={styles.summaryValue}>
                    {getDataSummary(selectedLog.requestData)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Response Size</Text>
                  <Text style={styles.summaryValue}>
                    {getDataSummary(selectedLog.responseData)}
                  </Text>
                </View>
              </View>
              <Text style={styles.summaryTimestamp}>
                {selectedLog.timestamp.toLocaleString()}
              </Text>
            </View>

            {/* Request Payload */}
            {selectedLog.requestData && (() => {
              const { preview, isTruncated } = formatLargeData(selectedLog.requestData);
              const summary = getDataSummary(selectedLog.requestData);
              
              return renderCollapsibleSection(
                '📤 Request Payload',
                'request',
                preview,
                summary,
                '#F59E0B',
                isTruncated,
                () => {
                  Clipboard.setString(formatJson(selectedLog.requestData));
                  Alert.alert('Success', 'Full request data copied to clipboard!');
                }
              );
            })()}

            {/* Response Data */}
            {(() => {
              if (!selectedLog.responseData) {
                return renderCollapsibleSection(
                  '📥 Response Data',
                  'response',
                  'No response data',
                  'Empty',
                  '#10B981'
                );
              }
              
              const { preview, isTruncated, fullSize } = formatLargeData(selectedLog.responseData);
              const summary = getDataSummary(selectedLog.responseData);
              
              return renderCollapsibleSection(
                '📥 Response Data',
                'response',
                preview,
                summary,
                '#10B981',
                isTruncated,
                () => {
                  Clipboard.setString(formatJson(selectedLog.responseData));
                  Alert.alert('Success', 'Full response data copied to clipboard!');
                }
              );
            })()}

            {/* Request Headers */}
            {renderCollapsibleSection(
              '📋 Request Headers',
              'headers',
              selectedLog.headers ? formatJson(selectedLog.headers) : 'No headers captured',
              selectedLog.headers ? `${Object.keys(selectedLog.headers).length} headers` : 'None',
              '#60A5FA'
            )}

            {/* CURL Command */}
            {renderCollapsibleSection(
              '🔧 CURL Command',
              'curl',
              generateCurl(selectedLog),
              'Copy-ready command',
              '#A78BFA'
            )}

            {selectedLog.error && (
              <View style={styles.detailSection}>
                <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Error</Text>
                <Text style={[styles.detailText, { color: '#EF4444' }]}>
                  {selectedLog.error}
                </Text>
              </View>
            )}
          </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  // Pan responder for draggable floating button with boundaries
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset();
      
      // Get current position
      const currentX = (pan.x as any)._value;
      const currentY = (pan.y as any)._value;
      
      // Calculate boundaries
      const minX = BOUNDARY_PADDING;
      const maxX = SCREEN_WIDTH - BUTTON_SIZE - BOUNDARY_PADDING;
      const minY = TOP_SAFE_AREA;
      const maxY = SCREEN_HEIGHT - BUTTON_SIZE - BOTTOM_SAFE_AREA;
      
      // Clamp position within boundaries
      let newX = currentX;
      let newY = currentY;
      
      if (currentX < minX) newX = minX;
      if (currentX > maxX) newX = maxX;
      if (currentY < minY) newY = minY;
      if (currentY > maxY) newY = maxY;
      
      // Animate to bounded position if needed
      if (newX !== currentX || newY !== currentY) {
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 7,
        }).start();
      }
    },
  });

  const openLogger = () => {
    const currentLogs = networkLogger.getLogs();
    setLogs(currentLogs);
    setVisible(true);
  };

  return (
    <>
      {/* Floating Debug Button - Always Visible */}
      {showFloatingButton && !visible && (
        <Animated.View
          style={[
            styles.floatingButton,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            onPress={openLogger}
            onLongPress={() => {
              networkLogger.clearLogs();
              setLogs([]);
              Alert.alert('Success', 'Network logs cleared!');
            }}
            style={styles.floatingButtonInner}
          >
            <Text style={styles.floatingButtonText}>🔍</Text>
            {logs.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{logs.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.container}>
            <View style={styles.header}>
            <View>
              <Text style={styles.title}>Network Logs</Text>
              {logs.length > 0 && (
                <View style={styles.statsRow}>
                  <Text style={styles.statItem}>📊 {getLogStats().total} total</Text>
                  <Text style={[styles.statItem, { color: '#10B981' }]}>✓ {getLogStats().success}</Text>
                  <Text style={[styles.statItem, { color: '#EF4444' }]}>✗ {getLogStats().errors}</Text>
                  <Text style={styles.statItem}>⏱ {getLogStats().avgDuration}ms avg</Text>
                </View>
              )}
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => {
                  networkLogger.clearLogs();
                  setLogs([]);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
            <ScrollView style={styles.logsList}>
              {logs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No network requests yet</Text>
                  <Text style={styles.emptySubtext}>
                    Make some API calls to see them here
                  </Text>
                </View>
              ) : (
                logs.map(renderLogItem)
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
      {renderLogDetails()}
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  curlButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  curlButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  logsList: {
    flex: 1,
  },
  logItem: {
    backgroundColor: '#374151',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  method: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  url: {
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  detailsScroll: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  jsonText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'monospace',
  },
  summaryCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  summaryUrl: {
    fontSize: 13,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  summaryTimestamp: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionSummary: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  jsonContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  truncatedWarning: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  truncatedText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  copyDataButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  copyDataButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  floatingButton: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 10,
  },
  floatingButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
