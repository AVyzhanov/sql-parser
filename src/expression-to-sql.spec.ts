import { expressionToSql } from "./expression-to-sql";

test.each`
  expression                                    | expected
  ${'datetime("2020-03-01 12:00:00")'}          | ${"'2020-03-01 12:00:00'::TIMESTAMP"}
  ${'datetime("now")'}                          | ${"NOW()"}
  ${'datetime("last year")'}                    | ${"'LAST YEAR'::TIMESTAMP"}
  ${'dateadd(datetime("today"), -13, day)'}     | ${"((CURRENT_DATE - INTERVAL '1 year') + INTERVAL '-13 DAY')"}
  ${'dateadd(datetime("2020-03-01"), 2, day)'}  | ${"('2020-03-01'::TIMESTAMP + INTERVAL '2 DAY')"}
  ${'datetrunc(datetime("2020-03-01"), week)'}  | ${"DATE_TRUNC('WEEK', '2020-03-01'::TIMESTAMP)"}
  ${'datetrunc(datetime("2020-03-01"), month)'} | ${"DATE_TRUNC('MONTH', '2020-03-01'::TIMESTAMP)"}
  ${'lastday(datetime("today"), month)'}        | ${"(DATE_TRUNC('MONTH', (CURRENT_DATE - INTERVAL '1 year')) + INTERVAL '1 MONTH - 1 DAY')::DATE"}
`(
  `expression '$expression' should return '$expected'`,
  ({ expression, expected }) => {
    expect(expressionToSql(expression)).toBe(expected);
  },
);
