<script lang="ts">
  import { debounce } from 'lodash-es'
  import Tooltip, { Wrapper } from '@smui/tooltip'

  import { STRING_COMPARE_THRESHOLD } from '$lib/constants'
  import { bucketList } from '$stores'

  export let bucketsMeetThereshold = []
  let inputValue = ''

  const handleFilterInput = debounce((e) => {
    bucketsMeetThereshold = []
    const bucketsMeetTheresholdFilterInput = new Map()
    const inputString = (e.target as HTMLInputElement).value

    if (inputString === '') {
      bucketsMeetThereshold = []
    } else {
      $bucketList.forEach((bucket) => {
        let targetStrings = [bucket.tags, bucket.label, bucket.description].flat()

        targetStrings.forEach((targetString) => {
          const score = stringSimilarity(inputString, targetString, false)

          if (score >= STRING_COMPARE_THRESHOLD) {
            bucketsMeetTheresholdFilterInput.set(bucket.path, true)
          }
        })
      })

      if (bucketsMeetTheresholdFilterInput.size === 0) {
        bucketsMeetTheresholdFilterInput.set('NO_RESULTS', true)
      }

      bucketsMeetThereshold = Array.from(bucketsMeetTheresholdFilterInput.keys())
    }
  }, 500)

  /**
   * Takes in two strings and returns how similiar they are via percentage. Uses Dice's Coefficient.
   * @param stringOne First string to be compared
   * @param stringTwo Second string to be compared
   * @param caseSensitive By default the comparison is case sensitive
   * @returns Percentage of how similiar the strings are
   */
  const stringSimilarity = (stringOne: string, stringTwo: string, caseSensitive = true) => {
    stringOne = stringOne.replace(/\s/g, '')
    stringTwo = stringTwo.replace(/\s/g, '')

    if (!caseSensitive) {
      stringOne = stringOne.toLowerCase()
      stringTwo = stringTwo.toLowerCase()
    }

    if (!stringOne.length && !stringTwo.length) return 1
    if (!stringOne.length || !stringTwo.length) return 0
    if (stringOne === stringTwo) return 1
    if (stringOne.length === 1 && stringTwo.length === 1) return 0
    if (stringOne.length < 2 || stringTwo.length < 2) return 0

    const firstBigrams = new Map()
    for (let i = 0; i < stringOne.length - 1; i++) {
      const bigram = stringOne.substring(i, i + 2)
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1

      firstBigrams.set(bigram, count)
    }

    let intersectionSize = 0
    for (let i = 0; i < stringTwo.length - 1; i++) {
      const bigram = stringTwo.substring(i, i + 2)
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0

      if (count > 0) {
        firstBigrams.set(bigram, count - 1)
        intersectionSize++
      }
    }

    return (2.0 * intersectionSize) / (stringOne.length + stringTwo.length - 2)
  }

  const clearInput = () => {
    bucketsMeetThereshold = []
    inputValue = ''
  }
</script>

<div class="columns is-vcentered" data-testid="filter-container">
  <div class="column is-10">
    <div class="control has-icons-left has-icons-right">
      <input
        data-testid="filter-bucket-input"
        class="input is-rounded"
        type="text"
        placeholder="Filter Buckets"
        bind:value={inputValue}
        on:input={handleFilterInput} />
      <span class="icon is-small is-left">
        <i class="fas fa-search" />
      </span>
    </div>
  </div>
  <div class="column">
    <Wrapper>
      <button class="button is-vcentered" on:click={clearInput} data-testid="filter-clear-button">
        <span class="icon is-small">
          <i class="fas fa-xmark" />
        </span>
      </button>
      <Tooltip showDelay={500} hideDelay={100} yPos="above">Clear input</Tooltip>
    </Wrapper>
  </div>
</div>
