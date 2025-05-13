export interface ComplianceStats {
  accessibility: {
    totalScanned: number;
    totalViolations: number;
    lastScan: Date;
  };
  dataProtection: {
    totalChecks: number;
    violations: number;
    lastCheck: Date;
  };
  auditLog: {
    totalEvents: number;
    lastEvent: Date;
  };
} 