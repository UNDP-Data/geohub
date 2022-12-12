<script lang="ts">
  export let headerTitle: string
  export let isExpanded = false
</script>

<ul
  class="accordion"
  aria-label="accordion">
  <li>
    <div class="accordion-title">
      <button
        tabindex="0"
        aria-expanded={isExpanded}
        class={`accordion-button ${isExpanded ? 'accordion--active' : ''}`}
        on:click={() => {
          isExpanded = !isExpanded
        }}>
        <p class="accordion-header">
          {headerTitle}
        </p>
      </button>

      <slot name="button" />
    </div>
    <div
      class={!isExpanded ? 'accordion__panel' : 'accordion--active'}
      aria-hidden={!isExpanded}
      role="region">
      <div class="accordion-content"><slot name="content" /></div>
    </div>
  </li>
</ul>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/accordion.min.css';

  .accordion {
    padding: 5px;
    padding-right: 10px;

    .accordion-title {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      .accordion-button {
        padding-top: 1rem;
        padding-bottom: 1rem;
        width: 90%;
      }

      .accordion-header {
        padding-left: 2rem;
        padding-right: 0rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-transform: capitalize;
        width: 90%;
      }
    }

    li button:before {
      content: '';
      margin-left: 0rem;
      position: absolute;
      left: 0px;
    }

    .accordion-content {
      cursor: default;
    }
  }
</style>
