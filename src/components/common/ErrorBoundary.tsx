import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Colio ErrorBoundary] Caught uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Feather name="alert-triangle" size={28} color="#FF5252" />
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected render issue occurred. You can tap below to reload.
            </Text>

            {this.state.error && (
              <ScrollView style={styles.errorBox} showsVerticalScrollIndicator={false}>
                <Text style={styles.errorText}>
                  {this.state.error.name}: {this.state.error.message}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.stackText}>
                    {this.state.errorInfo.componentStack.slice(0, 300)}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Feather name="refresh-cw" size={16} color="#050907" />
              <Text style={styles.retryButtonText}>Reload Colio</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050907',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F1310',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 82, 82, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F0FFF4',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B8F7A',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBox: {
    maxHeight: 120,
    width: '100%',
    backgroundColor: '#090D0B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#FF5252',
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 10,
    color: '#6B8F7A',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00E676',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
    width: '100%',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#050907',
  },
});
