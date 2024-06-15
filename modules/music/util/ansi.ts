const constants = {
    _prefix: "\x1b[",
    _suffix: "m",

    // formats
    fmt: {
        reset: "0",
        bold: "1",
        underline: "4",
    },

    // colors
    fg: {
        gray: "30",
        red: "31",
        green: "32",
        yellow: "33",
        blue: "34",
        magenta: "35",
        cyan: "36",
        white: "37",
    },

    // backgrounds
    bg: {
        bgDarkBlue: "40",
        bgOrange: "41",
        bgPurple: "42",
        bgDarkGreen: "43",
        bgGray: "44",
        bgIndigo: "45",
        bgLightGray: "46",
        bgWhite: "47",
    }
} as const;

type AnsiFormat = keyof typeof constants.fmt;
type AnsiColor = keyof typeof constants.fg;
type AnsiBackground = keyof typeof constants.bg;

type AnsiFormatString = `${AnsiFormat | ""}.${AnsiBackground | ""}.${AnsiColor | ""}`

export function ansi(format: AnsiFormatString) {
    const [fmt, bg, fg] = format.split(".");

    const fmtCode = constants.fmt[fmt as AnsiFormat]
    const bgCode = constants.bg[bg as AnsiBackground]
    const fgCode = constants.fg[fg as AnsiColor]

    return `${build(fmtCode)}${build(bgCode)}${build(fgCode)}`
}

function build(format?: string) {
    return format ? `${constants._prefix}${format}${constants._suffix}` : "";
}
