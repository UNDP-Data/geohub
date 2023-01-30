<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import IconImagePickerCard from '$components/controls/vector-styles/IconImagePickerCard.svelte'
  import { spriteImageList } from '$stores'

  export let iconImageAlt: string

  const iconGroupRanges = [
    { id: 'a - h', range: Array.from({ length: 8 }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i)) },
    { id: 'i - q', range: Array.from({ length: 9 }, (_, i) => String.fromCharCode('i'.charCodeAt(0) + i)) },
    { id: 'r - z', range: Array.from({ length: 9 }, (_, i) => String.fromCharCode('r'.charCodeAt(0) + i)) },
  ]

  let activeIconGroupId = iconGroupRanges[0].id
  let iconGroupsByLetter = []

  onMount(() => {
    iconGroupsByLetter = getIconGroupsByLetter()
  })

  const dispatch = createEventDispatcher()

  const handleSetActiveIconGroup = (iconGroupId: string) => {
    activeIconGroupId = iconGroupId
  }

  const handleIconClick = (spriteImageAlt: string) => {
    dispatch('handleIconClick', { spriteImageAlt })
  }

  const handleClosePopup = () => {
    dispatch('handleClosePopup')
  }

  const getIconGroupsByLetter = () => {
    const data = $spriteImageList.reduce((r, e) => {
      const firstLetter = e.alt[0].toLowerCase()
      let groupData = { id: '', range: [] }

      iconGroupRanges.forEach((group) => {
        if (group.range.includes(firstLetter)) {
          groupData = group
        }
      })

      // create group if not available
      if (!r[groupData.id]) {
        r[groupData.id] = [e]

        // add icon to existing group
      } else {
        r[groupData.id].push(e)
      }

      return r
    }, {})

    const groups = []

    Object.keys(data).forEach((key) => {
      groups.push({
        id: key,
        values: data[key],
      })
    })

    return groups
  }

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }
</script>

<div data-testid="icon-image-picker-container">
  <div class="columns is-vcentered is-mobile">
    <div class="column is-11">
      <div class="tabs">
        <ul>
          {#each iconGroupsByLetter as iconGroup}
            <li
              class={activeIconGroupId === iconGroup.id ? 'is-active' : ''}
              data-testid="group-letter-tab">
              <a
                href={'#'}
                on:click={() => handleSetActiveIconGroup(iconGroup.id)}>
                {iconGroup.id.toUpperCase()}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    <div
      class="column is-1 close"
      title="Close Icon Picker"
      on:keydown={handleEnterKey}
      on:click={handleClosePopup}>
      <i class="fa-solid fa-xmark" />
    </div>
  </div>
  <div class="columns">
    <div class="column card-icon">
      <ul class="is-size-6">
        {#each iconGroupsByLetter as iconGroup}
          {#if activeIconGroupId === iconGroup.id}
            {#each iconGroup.values as spriteImage}
              <li
                on:keydown={handleEnterKey}
                on:click={() => {
                  handleIconClick(spriteImage.alt)
                }}
                title="Icon Picker Card">
                <IconImagePickerCard
                  legendSymbolContainer={undefined}
                  iconImageAlt={spriteImage.alt}
                  iconImageSrc={spriteImage.src}
                  isSelected={iconImageAlt === spriteImage.alt ? true : false} />
              </li>
            {/each}
          {/if}
        {/each}
      </ul>
    </div>
  </div>
</div>

<style lang="scss">
  .card-icon {
    max-height: 260px;
    overflow-y: auto;

    ul {
      display: flex;
      flex-flow: row wrap;
      gap: 15px;

      li {
        cursor: pointer;
        padding: 1px;

        &:hover {
          padding: 0;
          border: 1px solid hsl(204, 86%, 53%);
        }
      }
    }
  }
  .close {
    cursor: pointer;
    position: relative;
    right: -13px;
  }
</style>
