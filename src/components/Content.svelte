
<script lang="ts">
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
  } from '@smui/drawer';
  
  import Button, { Label } from '@smui/button';
  import List, { Item, Text } from '@smui/list';

  export let open = false;
  let active = 'Vector tiles';

  function setActive(value: string) {
    active = value;
  }
</script>
<div>
  <Drawer variant="dismissible" bind:open anchor="right">
    <Header>
      <Title>Layers</Title>
      <Subtitle>...opartions with laye</Subtitle>
    </Header>
    <Content>
      <List>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Vector tiles')}
          activated={active === 'Vector tiles'}
        >
          <Text>Vector tiles</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('A Space Rocket')}
          activated={active === 'A Space Rocket'}
        >
          <Text>A Space Rocket</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('100 Pounds of Gravel')}
          activated={active === '100 Pounds of Gravel'}
        >
          <Text>100 Pounds of Gravel</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('All of the Shrimp')}
          activated={active === 'All of the Shrimp'}
        >
          <Text>All of the Shrimp</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('A Planet with a Mall')}
          activated={active === 'A Planet with a Mall'}
        >
          <Text>A Planet with a Mall</Text>
        </Item>
      </List>
    </Content>
  </Drawer>

  <AppContent class="app-content">
    <main class="main-content">
      <!-- <Button on:click={() => (open = !open)}
        ><Label>Toggle Drawer</Label></Button
      >
      <br /> -->
      <pre class="status">Active: {active}</pre>
    </main>
  </AppContent>
</div>



<style>
 
</style>
