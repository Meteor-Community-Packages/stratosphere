import { onMount } from 'solid-js';

/** Native modal dialog; rendered while mounted, closed with Esc, backdrop click or the close button. */
export const Modal = props => {
  let dialog;
  onMount(() => dialog.showModal());
  return (
    <dialog
      ref={dialog}
      class="modal"
      aria-label={props.title}
      onClose={() => props.onClose()}
      onClick={e => e.target === dialog && dialog.close()}
    >
      <header>
        <h2>{props.title}</h2>
        <button class="icon" aria-label="Close dialog" onClick={() => dialog.close()}>
          ×
        </button>
      </header>
      <div class="modal-body">{props.children}</div>
      <footer>
        {props.actions}
        <span class="spacer" />
        <button class="primary" onClick={() => dialog.close()}>
          Close
        </button>
      </footer>
    </dialog>
  );
};
