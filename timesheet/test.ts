import 'dotenv/config'
import { fs } from 'mz'
import { JWTOptions } from 'google-auth-library'
import { DataSync, createDefaultAuthorizationClient } from 'timesheet-on.lib'

const TARGET_USER = {
  name: 'Dahae',
  email: 'dahae@asiance.com',
}

export function getEnv(name: string): string {
  const env = process.env[name]

  if (env === undefined) {
    throw new Error(`Environment variable '${name}' must be specified`)
  }

  return env
}

export function createDefaultAuthorizationClientAlt(mergeOptions?: JWTOptions) {
  return createDefaultAuthorizationClient(
    JSON.parse(getEnv('TIMESHEET_ON_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS')),
    getEnv('TIMESHEET_ON_GOOGLE_SERVICE_ACCOUNT_DELEGATION_ADDRESS'),
    getEnv('TIMESHEET_ON_GOOGLE_SERVICE_SCOPES').split(','),
    mergeOptions,
  )
}

(async () => {
  const userAuthClient = createDefaultAuthorizationClientAlt({
    subject: TARGET_USER.email,
  })

  const dataFetcher = new DataSync({
    auth: userAuthClient,
    email: TARGET_USER.email,
  })

  const cals = await dataFetcher.getCalendars()
  const onlyMyCals = cals.filter((e) => e.summary === 'Timesheet - Dahae')
  const ids = onlyMyCals.map((e) => e.id as string)

  const data = await dataFetcher.getTimesheetReportByMonth(
    ids.map((e) => ({
      id: e as string,
      tags: [],
    })),
    {
      timeMin: '2019-06-27T15:00:00+09:00',
      timeMax: '2019-07-23T15:00:00+09:00',
    },
    {
      startDate: '2019-06-27T15:00:00+09:00',
      endDate: '2019-07-23T15:00:00+09:00',
    },
  )

  await fs.writeFile('yey-result.json', JSON.stringify(data))
})()
