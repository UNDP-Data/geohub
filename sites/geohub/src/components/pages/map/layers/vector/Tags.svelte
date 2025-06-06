<script lang="ts">
	import { browser } from '$app/environment';
	import { clean, handleEnterKey } from '@undp-data/svelte-undp-components';
	import { clickOutside } from 'svelte-use-click-outside';

	let tag = $state('');
	let arrelementsmatch: string[] = $state([]);
	let regExpEscape = (s) => {
		return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
	};

	interface Props {
		tags?: string[];
		maxTags?: boolean | number;
		onlyUnique?: boolean;
		removeKeys?: number[];
		placeholder?: string;
		allowPaste?: boolean;
		allowDrop?: boolean;
		splitWith?: string;
		autoComplete?: string[];
		autoCompleteKey?: boolean;
		autoCompleteMarkupKey?: boolean;
		name?: string;
		id?: string;
		allowBlur?: boolean;
		disable?: boolean;
		minChars?: number;
		onlyAutocomplete?: boolean;
		labelText?: string;
		labelShow?: boolean;
		hideOptions?: boolean;
		ontags?: (tags: string[]) => void;
	}

	let {
		tags = $bindable([]),
		maxTags = false,
		onlyUnique = false,
		removeKeys = [8],
		placeholder = $bindable(''),
		allowPaste = false,
		allowDrop = false,
		splitWith = ',',
		autoComplete = [],
		autoCompleteKey = false,
		autoCompleteMarkupKey = false,
		name = 'svelte-tags-input',
		id = uniqueID(),
		allowBlur = false,
		disable = false,
		minChars = 0,
		onlyAutocomplete = false,
		labelText = 'svelte-tags-input',
		labelShow = false,
		hideOptions = $bindable(false),
		ontags = (tags) => {
			console.log(tags);
		}
	}: Props = $props();

	let layoutElement: HTMLElement | undefined = $state();

	const matchsID = id + '_matchs';

	let storePlaceholder = placeholder;

	function setTag(e) {
		const currentTag = e.target.value;
		// if key is enter, add tag
		if (e.key === 'Enter' && currentTag !== '' && !onlyAutocomplete) {
			tags = [...tags, currentTag];
			if (ontags) ontags(tags);
			e.target.value = '';
		}

		if (removeKeys) {
			removeKeys.forEach(function (key) {
				if (key === e.keyCode && tag === '') {
					tags.pop();
					tags = tags;

					if (ontags) ontags(tags);

					arrelementsmatch = [];
					document.getElementById(id).readOnly = false;
					placeholder = storePlaceholder;
					document.getElementById(id).focus();
				}
			});
		}

		// ArrowDown : focus on first element of the autocomplete
		if (e.keyCode === 40 && autoComplete && document.getElementById(matchsID)) {
			e.preventDefault();
			document.getElementById(matchsID).querySelector('li:first-child').focus();
		} // ArrowUp : focus on last element of the autocomplete
		else if (e.keyCode === 38 && autoComplete && document.getElementById(matchsID)) {
			e.preventDefault();
			document.getElementById(matchsID).querySelector('li:last-child').focus();
		}
	}

	function addTag(currentTag) {
		if (typeof currentTag === 'object' && currentTag !== null) {
			if (!autoCompleteKey) {
				return console.error(
					"'autoCompleteKey' is necessary if 'autoComplete' result is an array of objects"
				);
			}

			var currentObjTags = currentTag;
			currentTag = currentTag[autoCompleteKey].trim();
		} else {
			currentTag = currentTag.trim();
		}

		if (currentTag === '') return;
		if (maxTags && tags.length === maxTags) return;
		if (onlyUnique && tags.includes(currentTag)) return;
		if (onlyAutocomplete && arrelementsmatch.length === 0) return;

		tags.push(currentObjTags ? currentObjTags : currentTag);
		tags = tags;
		tag = '';

		if (ontags) ontags(tags);

		// Hide autocomplete list
		// Focus on svelte tags input
		arrelementsmatch = [];
		document.getElementById(id).focus();

		if (maxTags && tags.length === maxTags) {
			document.getElementById(id).readOnly = true;
			placeholder = '';
		}
	}

	function removeTag(i) {
		tags.splice(i, 1);
		tags = tags;

		if (ontags) ontags(tags);

		// Hide autocomplete list
		// Focus on svelte tags input
		arrelementsmatch = [];
		document.getElementById(id).readOnly = false;
		placeholder = storePlaceholder;
		document.getElementById(id).focus();
	}

	function onPaste(e) {
		if (!allowPaste) return;
		e.preventDefault();

		const data = getClipboardData(e);
		splitTags(data).map((tag) => addTag(tag));
	}

	function onDrop(e) {
		if (!allowDrop) return;
		e.preventDefault();

		const data = e.dataTransfer.getData('Text');
		splitTags(data).map((tag) => addTag(tag));
	}

	function onFocus() {
		hideOptions = false;
		layoutElement.classList.add('focus');
	}
	function onFocusIn() {
		hideOptions = false;
	}

	function onBlur(e, tag) {
		layoutElement.classList.remove('focus');

		if (!document.getElementById(matchsID) && allowBlur) {
			e.preventDefault();
			addTag(tag);
		}
	}

	function onClick() {
		minChars == 0 && getMatchElements();
	}

	function getClipboardData(e) {
		if (browser && window.clipboardData) {
			return window.clipboardData.getData('Text');
		}

		if (e.clipboardData) {
			return e.clipboardData.getData('text/plain');
		}

		return '';
	}

	function splitTags(data) {
		return data.split(splitWith).map((tag) => tag.trim());
	}

	function escapeHTML(string) {
		const htmlEscapes = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			'/': '&#x2F;'
		};
		return ('' + string).replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
	}

	function buildMatchMarkup(search, value) {
		return escapeHTML(value).replace(
			RegExp(regExpEscape(search.toLowerCase()), 'i'),
			'<strong>$&</strong>'
		);
	}

	async function getMatchElements(input) {
		if (!autoComplete) return;

		let value = input ? input.target.value : '';
		let autoCompleteValues = JSON.parse(JSON.stringify(autoComplete));

		// Escape
		if (
			(minChars > 0 && value == '') ||
			(input && input.keyCode === 27) ||
			value.length < minChars
		) {
			arrelementsmatch = [];
			return;
		}

		let matchs = autoCompleteValues;

		if (typeof autoCompleteValues[0] === 'object' && autoCompleteValues !== null) {
			if (!autoCompleteKey) {
				return console.error(
					"'autoCompleteValue' is necessary if 'autoComplete' result is an array of objects"
				);
			}

			matchs = autoCompleteValues.filter((e) =>
				e[autoCompleteKey].toLowerCase().includes(value.toLowerCase())
			);
			matchs = matchs.map((matchTag) => {
				return {
					label: matchTag,
					search: autoCompleteMarkupKey
						? matchTag[autoCompleteMarkupKey]
						: buildMatchMarkup(value, matchTag[autoCompleteKey])
				};
			});
		} else {
			matchs = autoCompleteValues.filter((e) => e.toLowerCase().includes(value.toLowerCase()));

			matchs = matchs.map((matchTag) => {
				return {
					label: matchTag,
					search: buildMatchMarkup(value, matchTag)
				};
			});
		}

		if (onlyUnique === true && !autoCompleteKey) {
			matchs = matchs.filter((tag) => !tags.includes(tag.label));
		}

		arrelementsmatch = matchs;
	}

	function navigateAutoComplete(e, autoCompleteIndex, autoCompleteLength, autoCompleteElement) {
		if (!autoComplete) return;

		e.preventDefault();

		// ArrowDown
		if (e.keyCode === 40) {
			// Last element on the list ? Go to the first
			if (autoCompleteIndex + 1 === autoCompleteLength) {
				document.getElementById(matchsID).querySelector('li:first-child').focus();
				return;
			}
			document.getElementById(matchsID).querySelectorAll('li')[autoCompleteIndex + 1].focus();
		} else if (e.keyCode === 38) {
			// ArrowUp
			// First element on the list ? Go to the last
			if (autoCompleteIndex === 0) {
				document.getElementById(matchsID).querySelector('li:last-child').focus();
				return;
			}
			document.getElementById(matchsID).querySelectorAll('li')[autoCompleteIndex - 1].focus();
		} else if (e.keyCode === 13) {
			// Enter
			addTag(autoCompleteElement);
		} else if (e.keyCode === 27) {
			// Escape
			arrelementsmatch = [];
			document.getElementById(id).focus();
		}
	}

	function uniqueID() {
		return 'sti_' + Math.random().toString(36).substring(2, 11);
	}
</script>

<div
	class="svelte-tags-input-layout p-1"
	class:sti-layout-disable={disable}
	bind:this={layoutElement}
	use:clickOutside={() => (hideOptions = true)}
	aria-label="Keyword Search"
>
	<label for={id} class={labelShow ? '' : 'sr-only'}>{labelText}</label>

	{#if tags.length > 0}
		{#each tags as tag, i (tags.indexOf(tag))}
			<div
				class="tags has-addons mb-0"
				aria-label={typeof tag === 'string' ? clean(tag) : clean(tag[autoCompleteKey])}
			>
				<span class="tag is-info is-light mb-0">
					{#if typeof tag === 'string'}
						{clean(tag)}
					{:else}
						{clean(tag[autoCompleteKey])}
					{/if}
				</span>
				{#if !disable}
					<!-- svelte-ignore a11y_missing_attribute -->
					<a
						tabindex="0"
						role="button"
						aria-label="delete"
						class="tag is-delete mb-0"
						data-sveltekit-preload-code="off"
						data-sveltekit-preload-data="off"
						onclick={() => removeTag(i)}
						onkeydown={handleEnterKey}
					></a>
				{/if}
			</div>
		{/each}
	{/if}
	<input
		type="text"
		{id}
		{name}
		bind:value={tag}
		onkeydown={setTag}
		onkeyup={getMatchElements}
		onpaste={onPaste}
		ondrop={onDrop}
		onfocus={onFocus}
		onfocusin={onFocusIn}
		onblur={(e) => onBlur(e, tag)}
		onclick={onClick}
		class="svelte-tags-input"
		{placeholder}
		disabled={disable}
	/>
</div>

{#if autoComplete && arrelementsmatch.length > 0}
	<div style="z-index: 99" class="svelte-tags-input-matchs-parent" hidden={hideOptions}>
		<ul id="{id}_matchs" class="svelte-tags-input-matchs">
			{#each arrelementsmatch as element, index (arrelementsmatch.indexOf(element))}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					aria-label={element.label}
					title={element.label}
					tabindex="-1"
					onkeydown={(e) => navigateAutoComplete(e, index, arrelementsmatch.length, element.label)}
					onclick={() => addTag(element.label)}
				>
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html clean(element.search)}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	/* CSS svelte-tags-input */

	.svelte-tags-input,
	.svelte-tags-input-matchs,
	.svelte-tags-input-layout label {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans',
			'Droid Sans', 'Helvetica Neue', sans-serif;
		font-size: 11.375px;
		padding: 2px 5px;
	}

	/* svelte-tags-input-layout */

	.svelte-tags-input-layout {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-ms-flex-wrap: wrap;
		flex-wrap: wrap;
		-webkit-box-align: center;
		-ms-flex-align: center;
		align-items: center;
		border: solid 1px #ccc;
		background: #fff;
		border-radius: 2px;
	}

	.svelte-tags-input-layout:focus,
	.svelte-tags-input-layout:hover {
		border: solid 1px #eee;
	}

	/* svelte-tags-input */

	.svelte-tags-input {
		-webkit-box-flex: 1;
		-ms-flex: 1;
		flex: 1;
		margin: 0;
		margin-top: 5px;
		border: none;
	}

	.svelte-tags-input:focus {
		outline: 0;
	}

	/* svelte-tags-input-matchs */

	.svelte-tags-input-matchs-parent {
		position: relative;
	}

	.svelte-tags-input-matchs {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		margin: 3px 0;
		padding: 0px;
		background: #fff;
		border: solid 1px #ccc;
		border-radius: 2px;
		max-height: 310px;
		overflow: scroll;
		overflow-x: auto;
	}

	.svelte-tags-input-matchs li {
		list-style: none;
		padding: 5px;
		border-radius: 2px;
		cursor: pointer;
	}

	.svelte-tags-input-matchs li:hover,
	.svelte-tags-input-matchs li:focus {
		background: #eee;
		color: #000;
		outline: none;
	}

	/* svelte-tags-input disabled */
	.svelte-tags-input-layout.sti-layout-disable,
	.svelte-tags-input:disabled {
		background: #eaeaea;
		cursor: not-allowed;
	}

	.svelte-tags-input-layout.sti-layout-disable:hover,
	.svelte-tags-input-layout.sti-layout-disable:focus {
		border-color: #ccc;
	}

	.svelte-tags-input-layout label.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
