import { createSignal, For, Show } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { Meteor } from 'meteor/meteor';
import { createTracker, getCount, plural, types } from './lib';

const pageSize = 10;

export const List = () => {
  const params = useParams();
  const [limit, setLimit] = createSignal(pageSize);
  const type = () => types[params.type];
  const sort = () => (params.sort === 'lastUpdated' ? { lastUpdated: -1 } : { name: 1 });

  const data = createTracker(() => {
    const { subscribeList, collection, count } = type();
    const handle = Meteor.subscribe(subscribeList, { limit: limit(), sort: sort() });
    return {
      ready: handle.ready(),
      count: getCount(count),
      items: collection.find({ private: true }, { sort: sort(), limit: limit() }).fetch(),
    };
  });

  return (
    <section>
      <h2>{data().count ? plural(data().count, type().label) : `No published ${type().label}s`}</h2>
      <ul class="cards">
        <For each={data().items}>
          {item => (
            <li>
              <A href={`/${type().id}/details/${item.name}`} class="card">
                <h3>{item.name}</h3>
                <p>{item.latestVersion?.description}</p>
                <Show when={item.latestVersion}>
                  <small>Latest version: {item.latestVersion.version}</small>
                </Show>
              </A>
            </li>
          )}
        </For>
      </ul>
      <Show when={data().items.length < data().count}>
        <button disabled={!data().ready} onClick={() => setLimit(limit() + pageSize)}>
          {data().ready ? 'Load more' : 'Loading…'}
        </button>
      </Show>
    </section>
  );
};
