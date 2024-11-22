import dotenv from 'dotenv'
import FeedGenerator from './server'

const run = async () => {
  dotenv.config()
  const hostname = 'alpeter45.piemadd.com';
  const serviceDid = `did:web:${hostname}`;
  const server = FeedGenerator.create({
    port: 3000,
    listenhost: '0.0.0.0',
    sqliteLocation: '/dbdir/posts.sqlite',
    subscriptionEndpoint: 'wss://bsky.network',
    publisherDid:
      "did:plc:zmvv42wlsta462gsewywlvfl",
    subscriptionReconnectDelay: 3000,
    hostname,
    serviceDid,
  })
  await server.start()
  console.log(
    `🤖 running feed generator at http://${server.cfg.listenhost}:${server.cfg.port}`,
  )
}

const maybeStr = (val?: string) => {
  if (!val) return undefined
  return val
}

const maybeInt = (val?: string) => {
  if (!val) return undefined
  const int = parseInt(val, 10)
  if (isNaN(int)) return undefined
  return int
}

run()
