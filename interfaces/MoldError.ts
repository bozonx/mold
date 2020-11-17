export interface MoldError {
  code: number;
  // it isn't required for standard messages which will be translated.
  message?: string;
}
