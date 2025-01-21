type DateTimeExpressionNode = {
  type: 'DATETIME';
  value: string
};
type DateAddExpressionNode = {
  type: 'DATEADD';
  expr: ExpressionNode;
  amount: number;
  unit: string
};
type DateTruncExpressionNode = {
  type: 'DATETRUNC';
  expr: ExpressionNode;
  unit: string
};
type LastDayExpressionNode = {
  type: 'LASTDAY';
  expr: ExpressionNode;
  unit: string
};

type ExpressionNode =
  | DateTimeExpressionNode
  | DateAddExpressionNode
  | DateTruncExpressionNode
  | LastDayExpressionNode;

