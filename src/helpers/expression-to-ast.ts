export function expressionToAst(input: string): ExpressionNode {
  const trimmed = input.trim().toUpperCase();

  switch (true) {
    case trimmed.startsWith('DATETIME('):
      return _parseDateTime(trimmed);
    case trimmed.startsWith('DATEADD('):
      return _parseDateAdd(trimmed);
    case trimmed.startsWith('DATETRUNC('):
      return _parseDateTrunc(trimmed);
    case trimmed.startsWith('LASTDAY('):
      return _parseLastDay(trimmed);
    default:
      throw new Error('Unknown function call: ' + input);
  }
}

const _unitWhitelist = {
  DATEADD: ['YEAR', 'QUARTER', 'MONTH', 'WEEK', 'DAY', 'HOUR', 'MINUTE', 'SECOND'],
  DATETRUNC: ['YEAR', 'QUARTER', 'MONTH', 'WEEK'],
  LASTDAY: ['YEAR', 'MONTH', 'WEEK'],
};

/**
 * @example
 * ```
 * _parseDateTime('DATETIME("2020-03-01 12:00:00")');
 * // => { type: 'DATETIME', value: '2020-03-01 12:00:00' }
 *
 * _parseDateTime('DATETIME("now")');
 * // => { type: 'DATETIME', value: 'now' }
 *
 * _parseDateTime('DATETIME("today")');
 * // => { type: 'DATETIME', value: 'today' }
 * ```
 */
function _parseDateTime(input: string): ExpressionNode {
  const content = _extractBracketContent(input, 'DATETIME');

  const match = content.trim().match(/^"(.*)"$/); // TODO: add support for 'now' and 'today' validation

  if (!match) {
    throw new Error(`Invalid DATETIME argument: ${content}`);
  }

  const valueInsideQuotes = match[1];

  return { type: 'DATETIME', value: valueInsideQuotes };
}

/**
 * @example
 * ```
 * _parseDateAdd('DATEADD(DATETIME("today"), -13, day)');
 * // => { type: 'DATEADD', expr: { type: 'DATETIME', value: 'today' }, amount: -13, unit: 'day' }
 *
 * _parseDateAdd('DATEADD(DATEADD(DATETIME("today"), -13, day), 1, month)');
 * // => { type: 'DATEADD', expr: { type: 'DATEADD', expr: { type: 'DATETIME', value: 'today' }, amount: -13, unit: 'day' }, amount: 1, unit: 'month' }
 * ```
 */
function _parseDateAdd(input: string): ExpressionNode {
  const content = _extractBracketContent(input, 'DATEADD');

  const parts = content.split(',');
  if (parts.length !== 3) {
    throw new Error(`Invalid DATEADD expression, expected 3 arguments: ${content}`);
  }

  const expr = expressionToAst(parts[0].trim());

  const amount = parseInt(parts[1].trim(), 10);
  if (isNaN(amount)) {
    throw new Error(`Invalid integer for DATEADD: ${parts[1]}`);
  }

  const unit = _getUnit('DATEADD', parts[2]);

  return {
    type: 'DATEADD',
    expr,
    amount,
    unit
  };
}

/**
 * @example
 * ```
 * _parseDateTrunc('DATETRUNC(DATETIME("2020-03-01 12:00:00"), month)');
 * // => { type: 'DATETRUNC', expr: { type: 'DATETIME', value: '2020-03-01 12:00:00' }, unit: 'month' }
 *
 * _parseDateTrunc('DATETRUNC(DATEADD(DATETIME("today"), -13, day), month)');
 * // => { type: 'DATETRUNC', expr: { type: 'DATEADD', expr: { type: 'DATETIME', value: 'today' }, amount: -13, unit: 'day' }, unit: 'month' }
 * ```
 */
function _parseDateTrunc(input: string): ExpressionNode {
  const content = _extractBracketContent(input, 'DATETRUNC');

  const parts = content.split(',');
  if (parts.length !== 2) {
    throw new Error(`Invalid DATETRUNC expression, expected 2 arguments: ${content}`);
  }

  const expr = expressionToAst(parts[0].trim());

  const unit = _getUnit('DATETRUNC', parts[1]);

  return {
    type: 'DATETRUNC',
    expr,
    unit
  };
}

/**
 * @example
 * ```
 * _parseLastDay('LASTDAY(DATETIME("2020-03-01 12:00:00"), month)');
 * // => { type: 'LASTDAY', expr: { type: 'DATETIME', value: '2020-03-01 12:00:00' }, unit: 'month' }
 *
 * _parseLastDay('LASTDAY(DATEADD(DATETIME("today"), -13, day), month)');
 * // => { type: 'LASTDAY', expr: { type: 'DATEADD', expr: { type: 'DATETIME', value: 'today' }, amount: -13, unit: 'day' }, unit: 'month' }
 * ```
 */
function _parseLastDay(input: string): ExpressionNode {
  const content = _extractBracketContent(input, 'LASTDAY');

  const parts = content.split(',');
  if (parts.length !== 2) {
    throw new Error(`Invalid LASTDAY expression, expected 2 arguments: ${content}`);
  }

  const expr = expressionToAst(parts[0].trim());

  const unit = _getUnit('LASTDAY', parts[1]);

  return {
    type: 'LASTDAY',
    expr,
    unit
  };
}

function _getUnit(type: 'DATEADD' | 'DATETRUNC' | 'LASTDAY', unit: string): string {
  const trimmed = unit.trim().toUpperCase();

  if (!_unitWhitelist[type].includes(trimmed)) {
    throw new Error(`Invalid unit for ${type}: ${trimmed}`);
  }

  return trimmed;
}

/**
 * Cuts the string inside the brackets after the function name
 *   e.g. `DATETIME("2020-03-01") -> "2020-03-01"`
 */
function _extractBracketContent(input: string, funcName: string): string {
  const prefix = funcName + '(';

  if (!input.startsWith(prefix) || !input.endsWith(')')) {
    throw new Error(`Invalid expression for ${funcName}: ${input}`);
  }

  return input.substring(prefix.length, input.length - 1).trim();
}
