import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription';

const re = new RegExp("\s*al-*pet(er|ah)-*(45)*")

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return

    const ops = await getOpsByType(evt)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        // in post text
        if (create.record.text.toLowerCase().match(re)) return true;

        // in image alt text
        if (create.record.embed && create.record.embed['$type'] == 'app.bsky.embed.images') {
          // @ts-ignore
          for (let i = 0; i < create.record.embed.images.length; i++) {
            // @ts-ignore
            const image = create.record.embed.images[i];
            if (image.alt && image.alt.match(re)) return true;
          }
        }

        // nothing
        return false;
      })
      .map((create) => {
        // map alf-related posts to a db row
        console.log(create.cid, create.record.text)
        return {
          uri: create.uri,
          cid: create.cid,
          indexedAt: new Date().toISOString(),
        }
      })

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
