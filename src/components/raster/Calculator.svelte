<script lang="ts">
  import Button from '@smui/button/src/Button.svelte'
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button'

  export let expression = ''

  const arithmeticOperators = ['+', '-', '*', '/']
  const compOperators = ['==', '!=', '<', '<=', '>', '>=']
  const logicalOperators = ['&', '|', '~']
  const parantheses = ['(', ')']
  const operators = [...arithmeticOperators, ...compOperators, ...logicalOperators, ...parantheses]
  let operator = undefined
  const fuctions = ['where(cond,true,false)', 'sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs']
  let func = ''

  $: operator, setOperator()

  const setOperator = () => {
    if (operator) {
      console.log(`operator is ${operator}`)
      expression += `${operator}`
    }
  }

  const setFunc = () => {
    if (func) {
      expression += ` ${func} `
    }
  }
  $: func, setFunc()
</script>

<div class="onecol">
  <textarea
    bind:value={expression}
    style="width:95%; min-height:45pt" />
</div>
<div class="one">
  <Button
    on:click={() => {
      expression = ''
    }}><Label>Clear</Label></Button>
</div>
<div class="cwrapper">
  <div>
    <SegmentedButton
      segments={operators}
      let:segment
      singleSelect
      bind:selected={operator}>
      <Segment {segment}>
        <Label style="width:20px">{segment}</Label>
      </Segment>
    </SegmentedButton>
  </div>
  <div>
    <SegmentedButton
      segments={fuctions}
      let:segment
      singleSelect
      bind:selected={func}>
      <Segment {segment}>
        <Label style="width:auto">{segment}</Label>
      </Segment>
    </SegmentedButton>
  </div>
</div>

<style>
  .cwrapper {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(-1, minmax(0, 1fr));
    gap: 2px, 2px;
  }
  .onecol {
    grid-column: 1/-1;
  }
</style>
