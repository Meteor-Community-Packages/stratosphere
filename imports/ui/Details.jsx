import { createResource, createSignal, For, Show } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { Meteor } from 'meteor/meteor';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { callMethod, canUnpublish, createTracker, formatDate, getCount, plural, types } from './lib';
import { Modal } from './Modal';

async function fetchReadme(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  return DOMPurify.sanitize(await marked.parse(await response.text()));
}

export const Details = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [allVersions, setAllVersions] = createSignal(false);
  const [selectedVersion, setSelectedVersion] = createSignal();
  const type = () => types[params.type];

  const data = createTracker(() => {
    const { subscribeDetails, subscribeVersions, collection, versionsCollection, linkedBy, versionsCount } = type();
    const details = Meteor.subscribe(subscribeDetails, params.name);
    const versions = allVersions() && Meteor.subscribe(subscribeVersions, params.name);
    return {
      ready: details.ready(),
      loadingVersions: versions && !versions.ready(),
      item: collection.findOne({ name: params.name }),
      versions: versionsCollection.find({ [linkedBy]: params.name }, { sort: { versionMagnitude: -1 } }).fetch(),
      versionsCount: getCount(versionsCount),
    };
  });

  const [readme] = createResource(() => data().item?.latestVersion?.readme, fetchReadme);

  async function unpublish() {
    const { label, unpublish } = type();
    if (!confirm(`Unpublishing will permanently delete this ${label} and all related versions. Are you sure?`)) return;
    await callMethod(`Successfully unpublished ${label}`, `Error while unpublishing ${label}`, unpublish, data().item._id);
    navigate(`/${type().id}/list/name`);
  }

  return (
    <Show when={data().item} fallback={<p>{data().ready ? `No such ${type().label}.` : 'Loading…'}</p>}>
      <section class="card">
        <h2>{data().item.name}</h2>
        <p>{data().item.latestVersion?.description}</p>
        <Show when={canUnpublish() && data().item.private}>
          <button class="warn" onClick={unpublish}>
            Unpublish
          </button>
        </Show>
      </section>
      <div class="columns">
        <section class="card readme">
          <h2>README</h2>
          <Show when={data().item.latestVersion?.readme} fallback={<p>No info available</p>}>
            <Show when={!readme.error} fallback={<p>README unavailable.</p>}>
              <div class="markdown" innerHTML={readme() ?? 'Loading…'} />
            </Show>
          </Show>
        </section>
        <section class="card">
          <h2>{data().versionsCount ? plural(data().versionsCount, type().versionLabel) : `No published ${type().versionLabel}s`}</h2>
          <ul class="versions">
            <For each={data().versions}>
              {version => (
                <li>
                  <button class="link" onClick={() => setSelectedVersion(version)}>
                    <strong>{version.version}</strong>
                    <small>{formatDate(version.lastUpdated)}</small>
                  </button>
                </li>
              )}
            </For>
          </ul>
          <Show when={data().versions.length < data().versionsCount}>
            <button disabled={data().loadingVersions} onClick={() => setAllVersions(true)}>
              {data().loadingVersions ? 'Loading…' : `Load ${data().versionsCount - data().versions.length} more`}
            </button>
          </Show>
        </section>
      </div>
      <Show when={selectedVersion()}>
        <VersionDialog type={type()} version={selectedVersion()} onClose={() => setSelectedVersion()} />
      </Show>
    </Show>
  );
};

const VersionDialog = props => {
  const version = createTracker(() => {
    Meteor.subscribe(props.type.subscribeVersion, props.version._id);
    return props.type.versionsCollection.findOne(props.version._id);
  });

  async function unpublish() {
    const { versionLabel, unpublishVersion } = props.type;
    if (!confirm(`Unpublishing will remove this ${versionLabel}. Are you sure?`)) return;
    await callMethod(`Successfully unpublished ${versionLabel}`, `Error while unpublishing ${versionLabel}`, unpublishVersion, props.version._id);
    props.onClose();
  }

  return (
    <Modal
      title={`Version ${props.version.version}`}
      onClose={props.onClose}
      actions={
        <Show when={canUnpublish() && version()?.private}>
          <button class="warn" onClick={unpublish}>
            Unpublish
          </button>
        </Show>
      }
    >
      <pre>{JSON.stringify(version() ?? props.version, null, 2)}</pre>
    </Modal>
  );
};
