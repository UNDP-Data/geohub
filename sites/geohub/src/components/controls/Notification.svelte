<script lang="ts">
  export let type: 'info' | 'warning' | 'danger' | '' = 'info'

  let color = 'dodgerblue'
  let icon = 'fa-solid fa-circle-info'
  if (type === 'warning') {
    icon = 'fa-solid fa-triangle-exclamation'
    color = '#ffcc00'
  } else if (type === 'danger') {
    icon = 'fa-solid fa-skull-crossbones'
    color = '#cc3300'
  }
</script>

<div class="notification {`${type !== '' ? `is-${type} is-light` : ''}`} message">
  <div class="icon">
    <i
      class="fa-solid {icon} fa-lg"
      style="color:{color}" />
  </div>
  <div class="text"><slot /></div>
</div>

<style lang="scss">
  .message {
    display: flex;
    justify-content: left;
    align-items: center;
    padding: 10px;

    .text {
      padding-left: 15px;
    }
  }
</style>
