export const ANSI = {
  RESET: '\x1B[0m',
  SPACE: '\u00A0',

  BOLD: '\x1B[1m',
  DIM: '\x1B[2m',
  ITALIC: '\x1B[3m',
  UNDERLINE: '\x1B[4m',
  BLINK: '\x1B[5m',
  REVERSE: '\x1B[7m',
  HIDDEN: '\x1B[8m',

  FG: {
    BLACK: '\x1B[30m',
    RED: '\x1B[31m',
    GREEN: '\x1B[32m',
    YELLOW: '\x1B[33m',
    BLUE: '\x1B[34m',
    MAGENTA: '\x1B[35m',
    CYAN: '\x1B[36m',
    WHITE: '\x1B[37m',

    BRIGHT_BLACK: '\x1B[90m',
    BRIGHT_RED: '\x1B[91m',
    BRIGHT_GREEN: '\x1B[92m',
    BRIGHT_YELLOW: '\x1B[93m',
    BRIGHT_BLUE: '\x1B[94m',
    BRIGHT_MAGENTA: '\x1B[95m',
    BRIGHT_CYAN: '\x1B[96m',
    BRIGHT_WHITE: '\x1B[97m',
  },

  BG: {
    BLACK: '\x1B[40m',
    RED: '\x1B[41m',
    GREEN: '\x1B[42m',
    YELLOW: '\x1B[43m',
    BLUE: '\x1B[44m',
    MAGENTA: '\x1B[45m',
    CYAN: '\x1B[46m',
    WHITE: '\x1B[47m',

    BRIGHT_BLACK: '\x1B[100m',
    BRIGHT_RED: '\x1B[101m',
    BRIGHT_GREEN: '\x1B[102m',
    BRIGHT_YELLOW: '\x1B[103m',
    BRIGHT_BLUE: '\x1B[104m',
    BRIGHT_MAGENTA: '\x1B[105m',
    BRIGHT_CYAN: '\x1B[106m',
    BRIGHT_WHITE: '\x1B[107m',
  },

} as const