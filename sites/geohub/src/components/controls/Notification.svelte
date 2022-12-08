<script lang="ts">
  import Fa from 'svelte-fa'
  import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'
  import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons/faTriangleExclamation'
  import { faSkullCrossbones } from '@fortawesome/free-solid-svg-icons/faSkullCrossbones'

  export let type: 'info' | 'warning' | 'danger' | '' = 'info'

  let color = 'dodgerblue'
  let icon = faCircleInfo
  if (type === 'warning') {
    icon = faTriangleExclamation
    color = '#ffcc00'
  } else if (type === 'danger') {
    icon = faSkullCrossbones
    color = '#cc3300'
  }
</script>

<div class="notification {`${type !== '' ? `is-${type} is-light` : ''}`} message">
  <div class="icon">
    <Fa
      {icon}
      size="lg"
      primaryColor={color} />
  </div>
  <div class="text"><slot /></div>
</div>

<style lang="scss">
  .message {
    display: flex;
    justify-content: left;
    align-items: center;
    padding: 10px;

    @media (prefers-color-scheme: dark) {
      background: #323234;
      border-color: #30363d;
      color: white;
    }

    .text {
      padding-left: 15px;
    }
  }
</style>
