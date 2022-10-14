<script lang="ts">
  import * as EmailValidator from 'email-validator'
  import { MetadataConfig } from '../constants'
  import ConditionTag from './ConditionTag.svelte'

  export let name: string
  export let value: string | number

  let isSuccess = false

  $: value, validate()

  let validate = () => {
    if (name === 'email') {
      isSuccess = value && EmailValidator.validate(value.toString())
    } else {
      isSuccess = value && value.toString().length > 0
    }
  }
</script>

<div class="field is-horizontal">
  <div class="field-label is-normal">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">{MetadataConfig[name].title}</label>
  </div>
  <div class="field-body">
    <div class="field metadata-control">
      <p class="control">
        <slot />
      </p>

      <div class="condition-tag">
        <ConditionTag bind:isSuccess />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .metadata-control {
    position: relative;
  }

  .condition-tag {
    position: absolute;
    top: 7px;
    right: -20px;
  }
</style>
