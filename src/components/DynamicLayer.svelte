<script lang="ts">
  import {map} from '../stores/mapstore';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import {layerList} from '../stores/stores';
  import Chip, { Set, Text } from '@smui/chips';
  import Paper, { Title as PTitle, Subtitle, Content as PContent } from '@smui/paper';

 
  
  export let open = false;

  export let choices = [];
  let selected:Array<string> = [];

  

  //console.log('Choices in D ', JSON.stringify(choices));
</script>

<Dialog
  bind:open
  aria-labelledby="large-scroll-title"
  aria-describedby="large-scroll-content"
  surface$style="width: 600px; max-width: calc(100vw - 32px);">

  <Title id="large-scroll-title">Create a new combined/dynamic layer</Title>
  <Content id="large-scroll-content">
    <span>We have {choices.length} layers</span>
    <Set chips={choices} let:chip filter bind:selected>
      <Chip {chip} touch>
        <Text>{chip}</Text>
      </Chip>
    </Set>
  </Content>
  <Actions>
    <Button action="accept">
      <Label>Create</Label>
    </Button>
  </Actions>
</Dialog>

<!--<Paper variant="outlined">-->
<!--    <PTitle>Outlined Paper</PTitle>-->
<!--    <Subtitle>This is an outlined sheet of paper.</Subtitle>-->
<!--    <PContent><span>We have {choices.length} layers</span></PContent>-->
<!--</Paper>-->
