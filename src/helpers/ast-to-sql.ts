export function astToSql(node: ExpressionNode): string {
  switch (node.type) {
    case "DATETIME":
      return _convertDateTime(node.value);
    case "DATEADD":
      return _convertDateAdd(node.expr, node.amount, node.unit);
    case "DATETRUNC":
      return _convertDateTrunc(node.expr, node.unit);
    case "LASTDAY":
      return _convertLastDay(node.expr, node.unit);
    default:
      throw new Error(`Unhandled node type: ${(node as any).type}`);
  }
}

function _convertDateTime(value: string): string {
  switch (value) {
    case "NOW":
      return "NOW()";
    case "TODAY":
      return "(CURRENT_DATE - INTERVAL '1 year')";
    default:
      return `'${value.replace(/'/g, "''")}'::TIMESTAMP`;
  }
}

function _convertDateAdd(
  expr: ExpressionNode,
  amount: number,
  unit: string,
): string {
  const exprSql = astToSql(expr);

  return `(${exprSql} + INTERVAL '${amount} ${unit}')`;
}

function _convertDateTrunc(expr: ExpressionNode, unit: string): string {
  const exprSql = astToSql(expr);

  return `DATE_TRUNC('${unit}', ${exprSql})`;
}

function _convertLastDay(expr: ExpressionNode, unit: string): string {
  const exprSql = astToSql(expr);

  let interval: string;
  switch (unit) {
    case "YEAR":
      // last day of the year:
      interval = `'1 YEAR - 1 DAY'`;
      break;
    case "MONTH":
      // last day of the month:
      interval = `'1 MONTH - 1 DAY'`;
      break;
    case "WEEK":
      // last day of the week:
      interval = `'1 WEEK - 1 DAY'`;
      break;
    default:
      throw new Error(`Unsupported unit for LASTDAY: ${unit}`);
  }

  return `(DATE_TRUNC('${unit}', ${exprSql}) + INTERVAL ${interval})::DATE`;
}
