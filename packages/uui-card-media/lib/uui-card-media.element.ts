import { defineElement } from '@umbraco-ui/uui-base/lib/registration';
import { demandCustomElement } from '@umbraco-ui/uui-base/lib/utils';
import { UUICardElement } from '@umbraco-ui/uui-card/lib';
import { css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

/**
 *  @element uui-card-media
 *  @description - Card component for displaying a media item.
 *  @slot tag - slot for the tag with support for `<uui-tag>` elements
 *  @slot actions - slot for the actions with support for the `<uui-action-bar>` element
 *  @slot - slot for the default content area
 */
@defineElement('uui-card-media')
export class UUICardMediaElement extends UUICardElement {
  /**
   * Media name
   * @type {string}
   * @attr name
   * @default ''
   */
  @property({ type: String })
  name = '';

  /**
   * Media detail
   * @type {string}
   * @attr detail
   * @default ''
   */
  @property({ type: String })
  detail?: string;

  /**
   * Media file extension, without "."
   * @type {string}
   * @attr file-ext
   * @default ''
   */
  @property({ type: String, attribute: 'file-ext' })
  fileExt = '';

  @state()
  protected hasPreview = false;

  connectedCallback(): void {
    super.connectedCallback();

    demandCustomElement(this, 'uui-symbol-folder');
    demandCustomElement(this, 'uui-symbol-file');
  }

  private queryPreviews(e: Event): void {
    this.hasPreview =
      (e.composedPath()[0] as HTMLSlotElement).assignedElements({
        flatten: true,
      }).length > 0;
  }

  protected renderMedia() {
    if (this.hasPreview === true) return '';

    if (this.fileExt === '') {
      return html`<uui-symbol-folder id="entity-symbol"></uui-symbol-folder>`;
    }

    return html`<uui-symbol-file
      id="entity-symbol"
      type="${this.fileExt}"></uui-symbol-file>`;
  }

  #renderButton() {
    return html`
      <button
        id="open-part"
        tabindex=${this.disabled ? (nothing as any) : '0'}
        @click=${this.handleOpenClick}
        @keydown=${this.handleOpenKeydown}>
        ${this.#renderContent()}
      </button>
    `;
  }

  #renderLink() {
    return html`
      <a
        id="open-part"
        tabindex=${this.disabled ? (nothing as any) : '0'}
        href=${ifDefined(!this.disabled ? this.href : undefined)}
        target=${ifDefined(this.target || undefined)}
        rel=${ifDefined(
          this.rel ||
            ifDefined(
              this.target === '_blank' ? 'noopener noreferrer' : undefined,
            ),
        )}>
        ${this.#renderContent()}
      </a>
    `;
  }

  #renderContent() {
    return html`
      <div id="content" class="uui-text">
        <!--
        TODO: Implement info box when pop-out is ready
        -->
        <span id="name" title="${this.name}">${this.name}</span>
        <small id="detail">${this.detail}<slot name="detail"></slot></small>
      </div>
    `;
  }

  public render() {
    return html` ${this.renderMedia()}
      <slot @slotchange=${this.queryPreviews}></slot>
      ${this.href ? this.#renderLink() : this.#renderButton()}
      <!-- Select border must be right after .open-part -->
      <div id="select-border"></div>

      <slot name="tag"></slot>
      <slot name="actions"></slot>`;
  }

  static styles = [
    ...UUICardElement.styles,
    css`
      #entity-symbol {
        align-self: center;
        width: 60%;
        margin-bottom: var(--uui-size-layout-1);
        padding: var(--uui-size-space-6);
      }

      slot[name='tag'] {
        position: absolute;
        top: var(--uui-size-4);
        right: var(--uui-size-4);
        display: flex;
        justify-content: right;
        z-index: 2;
      }

      slot[name='actions'] {
        position: absolute;
        top: var(--uui-size-4);
        right: var(--uui-size-4);
        display: flex;
        justify-content: right;
        z-index: 2;
        opacity: 0;
        transition: opacity 120ms;
      }
      :host(:focus) slot[name='actions'],
      :host(:focus-within) slot[name='actions'],
      :host(:hover) slot[name='actions'] {
        opacity: 1;
      }

      slot:not([name])::slotted(*) {
        align-self: center;
        border-radius: var(--uui-border-radius);
        object-fit: cover;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      #open-part {
        position: absolute;
        z-index: 1;
        inset: 0;
        color: var(--uui-color-interactive);
        border: none;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      :host([disabled]) #open-part {
        pointer-events: none;
        color: var(--uui-color-contrast-disabled);
      }

      #open-part:hover {
        color: var(--uui-color-interactive-emphasis);
      }
      #open-part:hover #name {
        text-decoration: underline;
      }

      #open-part #name {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        overflow-wrap: anywhere;
      }

      :host([image]:not([image=''])) #open-part {
        transition: opacity 0.5s 0.5s;
        opacity: 0;
      }

      #content {
        position: relative;
        display: flex;
        width: 100%;
        flex-direction: column;
        font-family: inherit;
        box-sizing: border-box;
        text-align: left;
        word-break: break-word;
        padding-top: var(--uui-size-space-3);
      }

      #content::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-top: 1px solid var(--uui-color-divider);
        border-radius: 0 0 var(--uui-border-radius) var(--uui-border-radius);
        background-color: var(--uui-color-surface);
        pointer-events: none;
        opacity: 0.96;
      }

      #detail {
        opacity: 0.6;
      }

      :host(
          [image]:not([image='']):hover,
          [image]:not([image='']):focus,
          [image]:not([image='']):focus-within,
          [selected][image]:not([image='']),
          [error][image]:not([image=''])
        )
        #open-part {
        opacity: 1;
        transition-duration: 120ms;
        transition-delay: 0s;
      }

      :host([selectable]) #open-part {
        inset: var(--uui-size-space-3) var(--uui-size-space-4);
      }
      :host(:not([selectable])) #content {
        padding: var(--uui-size-space-3) var(--uui-size-space-4);
      }
      :host([selectable]) #content::before {
        inset: calc(var(--uui-size-space-3) * -1)
          calc(var(--uui-size-space-4) * -1);
        top: 0;
      }

      /*
      #info-icon {
        margin-right: var(--uui-size-2);
        display: flex;
        height: var(--uui-size-8);
      }
      */
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'uui-card-media': UUICardMediaElement;
  }
}
