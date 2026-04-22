# Email Buckets Cache

One JSON file per complete day: `YYYY-MM-DD.json` containing the `EmailBucket[]`
aggregated across all campaigns for that date in Pacific Time.

The `/api/emails/hourly` route reads these files before hitting Instantly's API.
Today's date (PT) is never cached — it's always refetched so in-flight sends
show up. Completed days are frozen.

To wipe the cache and rebuild it, delete the day files in this directory and
the next Scanner Funnel load will refill them.
