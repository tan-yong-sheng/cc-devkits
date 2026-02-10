/**
 * CLI utilities - Argument parsing helpers
 */

export interface ArgOption {
  type: 'string' | 'number' | 'boolean';
  short?: string;
  long?: string;
  required?: boolean;
  description?: string;
  default?: string | number | boolean;
}

export interface ParsedArgs {
  [key: string]: string | number | boolean | undefined | string[];
}

export interface ArgParserOptions {
  allowPositional?: boolean;
  stopAtPositional?: boolean;
}

/**
 * Parse command line arguments
 */
export function parseArgs(
  args: string[],
  options: Record<string, ArgOption>,
  cliOptions?: ArgParserOptions
): ParsedArgs {
  const { allowPositional = true, stopAtPositional = false } = cliOptions || {};

  const result: ParsedArgs = {};
  const positional: string[] = [];

  for (const [key, option] of Object.entries(options)) {
    if (option.default !== undefined) {
      result[key] = option.default;
    }
  }

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (!arg.startsWith('-')) {
      if (stopAtPositional) {
        break;
      }
      positional.push(arg);
      i++;
      continue;
    }

    const isShort = arg.startsWith('-') && !arg.startsWith('--');
    const keyCandidate = isShort ? arg.slice(1) : arg.slice(2);

    let option: ArgOption | undefined = options[keyCandidate];
    if (!option && arg.startsWith('--')) {
      option = Object.values(options).find((opt) => opt.long === keyCandidate);
    }
    if (!option && isShort) {
      option = Object.values(options).find((opt) => opt.short === keyCandidate);
    }

    if (!option) {
      console.error(`Warning: Unknown option: ${arg}`);
      i++;
      continue;
    }

    let value: string | number | boolean | undefined;

    if (option.type === 'boolean') {
      value = true;
      i++;
    } else if (option.type === 'number') {
      const nextArg = args[i + 1];
      if (nextArg === undefined || nextArg.startsWith('-')) {
        console.error(`Error: Option --${keyCandidate} requires a number`);
        process.exit(1);
      }
      value = parseFloat(nextArg);
      if (isNaN(value as number)) {
        console.error(`Error: Invalid number for --${keyCandidate}: ${nextArg}`);
        process.exit(1);
      }
      i += 2;
    } else {
      const nextArg = args[i + 1];
      if (nextArg === undefined || nextArg.startsWith('-')) {
        if (option.required) {
          console.error(`Error: Option --${keyCandidate} is required`);
          process.exit(1);
        }
        value = '';
        i++;
      } else {
        value = nextArg;
        i += 2;
      }
    }

    result[keyCandidate] = value;
  }

  if (allowPositional) {
    result._ = positional;
  }

  for (const [key, option] of Object.entries(options)) {
    if (option.required && result[key] === undefined) {
      console.error(`Error: Option --${key} is required`);
      process.exit(1);
    }
  }

  return result;
}
