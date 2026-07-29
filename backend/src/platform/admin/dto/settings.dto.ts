export interface SystemSettingsDTO {
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSymbols?: boolean;
  passwordExpirationDays?: number;
  passwordHistoryCount?: number;
  maxFailedAttempts?: number;
  sessionTimeoutMinutes?: number;
  jwtLifetimeHours?: number;
  maxFileUploadMB?: number;
  defaultTheme?: 'dark' | 'light' | 'system';
  defaultStandardEdition?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSender?: string;
  backupSchedule?: 'daily' | 'weekly' | 'monthly' | 'disabled';
  notificationEmailAlerts?: boolean;
}
