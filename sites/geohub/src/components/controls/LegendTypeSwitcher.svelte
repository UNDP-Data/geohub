<script lang="ts">
  export let legendType: 'simple' | 'advanced' = 'simple'
</script>

<div class="centered pb-2">
  <div class="field has-addons">
    <p class="control">
      <button
        class="button is-normal {`${legendType === 'simple' ? 'is-primary is-active' : 'is-primary is-light'}`}"
        on:click={() => (legendType = 'simple')}>
        <span>
          <i class="fa-solid fa-minus" />
          Simple
        </span>
      </button>
    </p>
    <p class="control">
      <button
        class="button is-normal {`${legendType === 'advanced' ? 'is-primary is-active' : 'is-primary is-light'}`}"
        on:click={() => (legendType = 'advanced')}>
        <span>
          <i class="fa-solid fa-list" />
          Advanced
        </span>
      </button>
    </p>
  </div>
</div>

<style lang="scss">
  :global(.centered) {
    width: max-content;
    margin: auto !important;
  }
</style>
