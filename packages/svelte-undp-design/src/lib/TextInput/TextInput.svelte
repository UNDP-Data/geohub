<script lang="ts">
  export let placeholder: string;
  export let label: string;
  export let name: string;
  export let value: string;
  export let disabled: boolean;
</script>
<label class={disabled ? "disabled":""} for="text">{label}</label>
<input
  type="text"
  bind:value={value}
  placeholder={placeholder}
  name={name}
  id="text"
/>
<style lang="scss">
  @use '../css/base-minimal.min.css';
  @use '../css/input-fields.min.css';
</style>