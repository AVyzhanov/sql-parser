import {expressionToAst} from './helpers/expression-to-ast'
import {astToSql} from './helpers/ast-to-sql'

export function expressionToSql(input: string): string {
  const ast = expressionToAst(input);
  return astToSql(ast);
}