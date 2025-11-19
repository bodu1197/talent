/**
 * 환경 변수 기반 로깅 시스템
 *
 * 사용법:
 * - logger.debug('디버그 메시지', { data })  // 개발 환경에서만 출력
 * - logger.info('정보 메시지', { data })
 * - logger.warn('경고 메시지', { data })
 * - logger.error('에러 메시지', error)      // 항상 출력
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'

/**
 * 로그 메타데이터 타입
 * - 객체 형태의 추가 정보를 담음
 * - 중첩된 객체와 배열 지원
 */
type LogMetadata = Record<string, unknown>

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
}

class Logger {
  private level: LogLevel
  private isDevelopment: boolean
  private isClient: boolean

  constructor() {
    // 환경 변수에서 로그 레벨 가져오기
    const envLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info') as LogLevel
    this.level = envLevel in LOG_LEVELS ? envLevel : 'info'

    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isClient = typeof window !== 'undefined'

    // 프로덕션 환경에서는 최소 warn 레벨
    if (!this.isDevelopment && LOG_LEVELS[this.level] < LOG_LEVELS.warn) {
      this.level = 'warn'
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level]
  }

  private formatMessage(level: string, message: string, data?: LogMetadata): string {
    const timestamp = new Date().toISOString()
    const environment = this.isClient ? '[Client]' : '[Server]'
    const prefix = `${timestamp} ${environment} [${level.toUpperCase()}]`

    return `${prefix} ${message}`
  }

  private sanitizeData(data: LogMetadata | unknown): LogMetadata | unknown {
    if (!data) return data

    // 민감한 정보 필드 목록
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'creditCard',
      'ssn',
      'bankAccount',
      'phoneNumber',
      'email' // email은 필요에 따라 제거/유지
    ]

    const sanitize = (obj: unknown): unknown => {
      if (typeof obj !== 'object' || obj === null) return obj
      if (Array.isArray(obj)) return obj.map(sanitize)

      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase()
        const isSensitive = sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))

        if (isSensitive) {
          sanitized[key] = '***REDACTED***'
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitize(value)
        } else {
          sanitized[key] = value
        }
      }
      return sanitized
    }

    return sanitize(data)
  }

  debug(message: string, data?: LogMetadata) {
    if (!this.shouldLog('debug')) return

    const sanitized = this.sanitizeData(data)
    // eslint-disable-next-line no-console
    console.log(this.formatMessage('debug', message), sanitized || '')
  }

  info(message: string, data?: LogMetadata) {
    if (!this.shouldLog('info')) return

    const sanitized = this.sanitizeData(data)
    // eslint-disable-next-line no-console
    console.info(this.formatMessage('info', message), sanitized || '')
  }

  warn(message: string, data?: LogMetadata) {
    if (!this.shouldLog('warn')) return

    const sanitized = this.sanitizeData(data)
    console.warn(this.formatMessage('warn', message), sanitized || '')
  }

  error(message: string, error?: Error | unknown, data?: LogMetadata) {
    if (!this.shouldLog('error')) return

    const sanitized = this.sanitizeData(data)

    if (error instanceof Error) {
      console.error(
        this.formatMessage('error', message),
        {
          name: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
          ...(sanitized as Record<string, unknown>)
        }
      )
    } else {
      console.error(
        this.formatMessage('error', message),
        error,
        sanitized || ''
      )
    }

    // TODO: 프로덕션 환경에서는 에러 로깅 서비스로 전송
    // 예: Sentry, LogRocket, DataDog 등
    // if (!this.isDevelopment) {
    //   sendToErrorTrackingService(message, error, sanitized)
    // }
  }

  /**
   * 개발 환경에서만 실행되는 로그
   * 디버깅 목적으로 사용하며 프로덕션에서는 완전히 제거됨
   */
  dev(message: string, data?: LogMetadata) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[DEV] ${message}`, data || '')
    }
  }
}

// 싱글톤 인스턴스 생성
export const logger = new Logger()

// 타입 export
export type { LogLevel }
