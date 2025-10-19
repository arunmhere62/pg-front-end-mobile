export interface NetworkLog {
  id: string;
  method: string;
  url: string;
  status?: number;
  headers?: any;
  requestData?: any;
  responseData?: any;
  error?: string;
  timestamp: Date;
  duration?: number;
}

class NetworkLogger {
  private logs: NetworkLog[] = [];
  private maxLogs = 50;

  addLog(log: NetworkLog) {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  updateLog(id: string, updates: Partial<NetworkLog>) {
    const index = this.logs.findIndex(log => log.id === id);
    
    if (index !== -1) {
      this.logs[index] = { ...this.logs[index], ...updates };
    } 
  }

  getLogs(): NetworkLog[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const networkLogger = new NetworkLogger();
